/* eslint-disable jsdoc/require-jsdoc */
import express from 'express'
// import { upload } from '../middleware/multer.js'
import { FileController } from '../controllers/file-controller.js'
import multer from 'multer'

export const router = express.Router()

const fileController = new FileController()

const upload = multer({ storage: multer.memoryStorage() })

router.post('/query', (req, res) => {
  res.send('Hello World!')
})

router.post('/upload', upload.single('file'), (req, res, next) => {
  fileController.receiveFile(req, res, next)
})
