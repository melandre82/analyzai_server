/* eslint-disable jsdoc/require-jsdoc */
import { TextSplitter } from '../functions/text-manipulation/textsplitter.js'
import { VectorManager } from '../functions/database-interaction/vectorManager.js'
import { parsePdf } from '../functions/dataloaders/parsePdf.js'
import { cleanText } from '../functions/text-manipulation/cleanText.js'
import bucket from '../config/firebaseAdmin.cjs'
import { getIo } from '../socket.js'
import admin from 'firebase-admin'

// initializeApp(firebaseConfig)

// const storage = getStorage()

const textSplitter = new TextSplitter()

const vectorManager = new VectorManager()

// const pdfLoader = new PdfLoader()

// export class FileController {
//   async receiveFile(req, res, next) {
//     try {
//       const dateTime = Date.now()
//       const file = req.file
//       const remoteFilePath = `${dateTime}-${file.originalname}`

//       // Create a new file in Firebase Storage and upload the data
//       const firebaseFile = bucket.file(remoteFilePath)
//       const writeStream = firebaseFile.createWriteStream({
//         metadata: {
//           contentType: file.mimetype,
//         },
//       })

//       writeStream.on('error', (error) => {
//         console.error('Error uploading file:', error)
//         res
//           .status(500)
//           .json({ success: false, message: 'File upload failed', error })
//       })

//       writeStream.on('finish', async () => {
//         console.log('File uploaded successfully.')

//         // Get the download URL
//         const downloadURL = await firebaseFile.getSignedUrl({
//           action: 'read',
//           expires: '03-01-2030',
//         })

//         // Send the response
//         // res.send({
//         //   message: 'file uploaded to firebase storage',
//         //   name: file.originalname,
//         //   type: file.mimetype,
//         //   downloadURL: downloadURL[0],
//         // })
//       })

//       // Upload the file
//       writeStream.end(file.buffer)

//       const pdfText = await parsePdf(file.buffer)

//       // const textString = JSON.stringify(pdfText)

//       console.log(pdfText)

//       // await cleanText(textString)

//       // console.log('textstring: ' + textString)

//       const doc = await textSplitter.splitText(
//         pdfText,
//         1000,
//         `${file.originalname}`
//       )

//       await vectorManager.index(doc)

//       res.status(200).json('File uploaded successfully.')

//       // console.log(doc)
//     } catch (error) {
//       console.error('File upload failed:', error)
//       res
//         .status(500)
//         .json({ success: false, message: 'File upload failed', error })
//     }
//   }
// }

export class FileController {
  async receiveFile(req, res, next) {
    try {
      // console.log('body: ' + JSON.stringify(req.body))
      const dateTime = Date.now()
      const file = req.file
      const uid = req.body.uid
      const remoteFilePath = `${uid}/${dateTime}-${file.originalname}`

      if (!(await admin.auth().getUser(uid))) {
        return
      }

      // Create a new file in Firebase Storage and upload the data
      const firebaseFile = bucket.file(remoteFilePath)
      const writeStream = firebaseFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      })

      writeStream.on('error', (error) => {
        console.error('Error uploading file:', error)
        res
          .status(500)
          .json({ success: false, message: 'File upload failed', error })
      })

      writeStream.on('finish', async () => {
        console.log('File uploaded successfully.')


        const downloadURL = await firebaseFile.getSignedUrl({
          action: 'read',
          expires: '03-01-2199',
        })

        const firestore = admin.firestore()
        const metadata = {
          fileName: file.originalname,
          downloadURL: downloadURL[0],
          uid: uid,

        }
        await firestore
          .collection('users')
          .doc(uid)
          .collection('files')
          .doc(file.originalname)
          .set(metadata)

        console.log('downloadURL: ' + downloadURL)
      })


      writeStream.end(file.buffer)

      const pdfText = await parsePdf(file.buffer)

      // const textString = JSON.stringify(pdfText)

      console.log(pdfText)

      // await cleanText(textString)

      // console.log('textstring: ' + textString)

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
}
