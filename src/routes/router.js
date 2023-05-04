/* eslint-disable jsdoc/require-jsdoc */
import express from 'express'
// import { upload } from '../middleware/multer.js'
import { FirebaseController } from '../controllers/firebase-controller.js'
import multer from 'multer'

export const router = express.Router()

const firebaseController = new FirebaseController()

const upload = multer({ storage: multer.memoryStorage() })

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.post('/upload', upload.single('file'), (req, res, next) => {
  firebaseController.receiveFile(req, res, next)
})
