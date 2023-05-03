/* eslint-disable jsdoc/require-jsdoc */
import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
// const multerStorage = multer.memoryStorage()
// const upload = multer({ storage: multerStorage })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.resolve(__dirname, '../../uploads')
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const upload = multer({ storage: multerStorage })

export const router = express.Router()

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    const file = req.file
    console.log('File uploaded:', file)
    res.json({ success: true, file })
  } catch (error) {
    console.error('File upload failed:', error)
    res
      .status(500)
      .json({ success: false, message: 'File upload failed', error })
  }
})
