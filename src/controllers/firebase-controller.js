/* eslint-disable jsdoc/require-jsdoc */
// import { storage } from '../config/firebase.js'
import { initializeApp } from 'firebase/app'
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from 'firebase/storage'
import { firebaseConfig } from '../config/firebase.js'
import multer from 'multer'

initializeApp(firebaseConfig)

const storage = getStorage()

// Setting up multer as a middleware to grab photo uploads


export class FirebaseController {
  async receiveFile(req, res, next) {
    try {
      const dateTime = Date.now()

      const file = req.file

      const storageRef = ref(storage, ` /${dateTime}-${file.originalname}`)

      const metadata = {
        contentType: file.mimetype,
      }

      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      )
      const downloadURL = await getDownloadURL(snapshot.ref)

      console.log('File successfully uploaded.')
      return res.send({
        message: 'file uploaded to firebase storage',
        name: req.file.originalname,
        type: req.file.mimetype,
        downloadURL
      })
    } catch (error) {
      console.error('File upload failed:', error)
      res
        .status(500)
        .json({ success: false, message: 'File upload failed', error })
    }
  }
}
