/* eslint-disable jsdoc/require-jsdoc */
import express from 'express'
// import { upload } from '../middleware/multer.js'
import { FileController } from '../controllers/file-controller.js'
import { QueryController } from '../controllers/query-controller.js'
import { ChatHistoryController } from '../controllers/chat-history-controller.js'
import multer from 'multer'
import { UserController } from '../controllers/user-controller.js'

export const router = express.Router()

const fileController = new FileController()

const queryController = new QueryController()

const chatHistoryController = new ChatHistoryController()

const userController = new UserController()

const upload = multer({ storage: multer.memoryStorage() })

router.post('/query', (req, res) => {
  queryController.query(req, res)
})

router.post('/upload', upload.single('file'), (req, res, next) => {
  fileController.receiveFile(req, res, next)
})

router.post('/chat-history', (req, res) => {
  chatHistoryController.getChatHistory(req, res)
})

router.post('/delete-user', (req, res) => {
  userController.deleteUser(req, res)
})
