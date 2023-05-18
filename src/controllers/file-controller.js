/* eslint-disable jsdoc/require-jsdoc */
// import { storage } from '../config/firebase.js'
// import { initializeApp } from 'firebase/app'
// import {
//   getStorage,
//   ref,
//   getDownloadURL,
//   uploadBytesResumable,
// } from 'firebase/storage'
// import { firebaseConfig } from '../config/firebase.js'
import { TextSplitter } from '../functions/text-manipulation/textsplitter.js'
import { VectorConverter } from '../functions/database-interaction/vectorconverter.js'
import { parsePdf } from '../functions/dataloaders/parsePdf.js'
import { cleanText } from '../functions/text-manipulation/cleanText.js'
import bucket from '../config/firebaseAdmin.cjs'

// initializeApp(firebaseConfig)

// const storage = getStorage()

const textSplitter = new TextSplitter()

const vectorConverter = new VectorConverter()

// const pdfLoader = new PdfLoader()

export class FileController {
  async receiveFile(req, res, next) {
    try {
      const dateTime = Date.now()
      const file = req.file
      const remoteFilePath = `${dateTime}-${file.originalname}`

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

        // Get the download URL
        const downloadURL = await firebaseFile.getSignedUrl({
          action: 'read',
          expires: '03-01-2030',
        })

        // Send the response
        // res.send({
        //   message: 'file uploaded to firebase storage',
        //   name: file.originalname,
        //   type: file.mimetype,
        //   downloadURL: downloadURL[0],
        // })
      })

      // Upload the file
      writeStream.end(file.buffer)

      const pdfText = await parsePdf(file.buffer)

      // const textString = JSON.stringify(pdfText)

      console.log(pdfText)

      // await cleanText(textString)

      // console.log('textstring: ' + textString)

      const doc = await textSplitter.splitText(pdfText, 1000, `${file.originalname}`)

      await vectorConverter.index(doc)

      console.log(doc)
    } catch (error) {
      console.error('File upload failed:', error)
      res
        .status(500)
        .json({ success: false, message: 'File upload failed', error })
    }
  }

  // async receiveFile(req, res, next) {
  //   try {

  //     const dateTime = Date.now()

  //     const file = req.file

  //     const storageRef = ref(storage, ` /${dateTime}-${file.originalname}`)

  //     const metadata = {
  //       contentType: file.mimetype,
  //     }

  //     const snapshot = await uploadBytesResumable(
  //       storageRef,
  //       req.file.buffer,
  //       metadata
  //     )
  //     const downloadURL = await getDownloadURL(snapshot.ref)

  //     console.log('File successfully uploaded.')
  //     return res.send({
  //       message: 'file uploaded to firebase storage',
  //       name: req.file.originalname,
  //       type: req.file.mimetype,
  //       downloadURL,
  //     })
  //   } catch (error) {
  //     console.error('File upload failed:', error)
  //     res
  //       .status(500)
  //       .json({ success: false, message: 'File upload failed', error })
  //   }
  // }
}
