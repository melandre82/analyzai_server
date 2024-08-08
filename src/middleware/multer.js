/* eslint-disable jsdoc/require-jsdoc */
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const multerStorage = multer.diskStorage({

  destination: (req, file, cb) => {
    const uploadsDir = path.resolve(__dirname, '../../uploads')
    cb(null, uploadsDir)
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

export const upload = multer({ storage: multerStorage })
