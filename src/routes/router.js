/* eslint-disable jsdoc/require-jsdoc */
import express from 'express'
// import { upload } from '../middleware/multer.js'
import { FileController } from '../controllers/file-controller.js'
import { QueryController } from '../controllers/query-controller.js'
import multer from 'multer'

export const router = express.Router()

const fileController = new FileController()

const queryController = new QueryController()

const upload = multer({ storage: multer.memoryStorage() })

router.post('/query', (req, res) => {
  queryController.query(req, res)
})

router.post('/upload', upload.single('file'), (req, res, next) => {
  fileController.receiveFile(req, res, next)
})

// router.post('/upload', upload.any(), (req, res, next) => {
//   fileController.receiveFile(req, res, next)
// })
