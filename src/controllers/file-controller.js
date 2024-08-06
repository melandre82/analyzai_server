/* eslint-disable jsdoc/require-jsdoc */
import { TextSplitter } from '../functions/text-manipulation/textsplitter.js'
import { VectorManager } from '../functions/database-interaction/vectorManager.js'
import { parsePdf } from '../functions/dataloaders/parsePdf.js'
// import { PdfLoader } from '../functions/dataloaders/pdfloader.js'

import bucket from '../config/firebaseAdmin.cjs'
import admin from 'firebase-admin'

const textSplitter = new TextSplitter()

const vectorManager = new VectorManager()

export class FileController {
  async receiveFile (req, res, next) {
    try {
      // console.log('body: ' + JSON.stringify(req.body))
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
        // console.log('File uploaded successfully.')

        const downloadURL = await firebaseFile.getSignedUrl({
          action: 'read',
          expires: '03-01-2199'
        })

        const firestore = admin.firestore()
        const metadata = {
          fileName: file.originalname,
          downloadURL: downloadURL[0],
          uid
        }
        await firestore
          .collection('users')
          .doc(uid)
          .collection('files')
          .doc(file.originalname)
          .set(metadata)

        // console.log('downloadURL: ' + downloadURL)
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

      // console.log(doc)
    } catch (error) {
      console.error('File upload failed:', error)
      res
        .status(500)
        .json({ success: false, message: 'File upload failed', error })
    }
  }

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

      const deleteQueryBatch = async (querySnapshot) => {
        const batch = firestore.batch()
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref)
          console.log(`Deleting document: ${doc.ref.path}`)
        })
        await batch.commit()
        console.log(`Batch of ${querySnapshot.size} documents deleted.`)
      }

      const deleteCollection = async (collectionRef) => {
        let querySnapshot = await collectionRef.limit(batchSize).get()
        while (!querySnapshot.empty) {
          await deleteQueryBatch(querySnapshot)
          querySnapshot = await collectionRef.limit(batchSize).get()
        }
      }

      console.log(`Starting deletion process for user ${uid}...`)
      await deleteCollection(userCollectionRef)

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
      console.error('Error deleting user files:', error.message)
    }
  }
}
