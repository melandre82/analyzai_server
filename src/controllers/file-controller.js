import { TextSplitter } from '../functions/text-manipulation/textsplitter.js'
import { VectorManager } from '../functions/database-interaction/vectorManager.js'
import { parsePdf } from '../functions/dataloaders/parsePdf.js'
import bucket from '../config/firebaseAdmin.cjs'
import admin from 'firebase-admin'

const textSplitter = new TextSplitter()

const vectorManager = new VectorManager()

/**
 * The FileController class.
 *
 */
export class FileController {
  /**
   * Receive a file and save it to Firebase Storage.
   *
   * @param {object} req The request object
   * @param {object} res The response object
   * @param {object} next The next object
   */
  async receiveFile (req, res, next) {
    try {
      const dateTime = Date.now()
      const file = req.file
      const uid = req.body.uid
      const remoteFilePath = `${uid}/${dateTime}-${file.originalname}`

      if (!(await admin.auth().getUser(uid))) {
        throw new Error('User does not exist')
      }

      // Create a new file in Firebase Storage and upload the data
      const firebaseFile = bucket.file(remoteFilePath)
      const writeStream = firebaseFile.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      })

      writeStream.on('error', (error) => {
        console.error('Error uploading file:', error)
        res
          .status(500)
          .json({ success: false, message: 'File upload failed', error })
      })

      writeStream.on('finish', async () => {
        const downloadURL = await firebaseFile.getSignedUrl({
          action: 'read',
          expires: '03-01-2199'
        })

        const firestore = admin.firestore()
        const metadata = {
          fileName: file.originalname,
          downloadURL: downloadURL[0],
          uid,
          creationDate: dateTime
        }
        await firestore
          .collection('users')
          .doc(uid)
          .collection('files')
          .doc(file.originalname)
          .set(metadata)
      })

      writeStream.end(file.buffer)

      const pdfText = await parsePdf(file.buffer)

      const doc = await textSplitter.splitText(
        pdfText,
        1000,
        `${file.originalname}`
      )

      await vectorManager.index(doc, uid)

      res.status(200).json('File uploaded successfully.')
    } catch (error) {
      console.error('File upload failed:', error)
      res
        .status(500)
        .json({ success: false, message: 'File upload failed', error })
    }
  }

  /**
   * Deletes all files associated with a user.
   *
   * @param {object} req The request object
   * @param {object} res The response object
   */
  async deleteUserFiles (req, res) {
    try {
      const uid = req.body.uid

      try {
        const user = await admin.auth().getUser(uid)
        if (!user) {
          throw new Error('User does not exist')
        }
        console.log(`User ${uid} exists.`)
      } catch (error) {
        console.error(`Error fetching user ${uid}:`, error.message)
        throw new Error('User does not exist')
      }

      const firestore = admin.firestore()
      const userCollectionRef = firestore.collection(`users/${uid}/files`)
      const batchSize = 500

      /**
       * Deletes a batch of documents from Firestore.
       *
       * @param {object} querySnapshot The query snapshot
       */
      const deleteQueryBatch = async (querySnapshot) => {
        const batch = firestore.batch()
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref)
        })
        await batch.commit()
      }

      /**
       * Deletes a collection from Firestore.
       *
       * @param {object} collectionRef The collection reference
       */
      const deleteCollection = async (collectionRef) => {
        let querySnapshot = await collectionRef.limit(batchSize).get()
        while (!querySnapshot.empty) {
          await deleteQueryBatch(querySnapshot)
          querySnapshot = await collectionRef.limit(batchSize).get()
        }
      }

      await deleteCollection(userCollectionRef)

      /**
       * Deletes all nested collections from Firestore.
       *
       * @param {object} collectionRef The collection reference
       */
      const deleteNestedCollections = async (collectionRef) => {
        const querySnapshot = await collectionRef.get()
        for (const doc of querySnapshot.docs) {
          const subcollections = await doc.ref.listCollections()
          for (const subcollection of subcollections) {
            await deleteCollection(subcollection)
          }
        }
      }

      await deleteNestedCollections(userCollectionRef)
    } catch (error) {
      res.status(500).send('Internal server error')
    }
  }
}
