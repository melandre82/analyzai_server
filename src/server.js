import express, { application } from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/mongoose.js'
import logger from 'morgan'
import { router } from './routes/router.js'
import cors from 'cors'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from './config/firebase.js'
// import admin from 'firebase-admin'
// import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath, URL } from 'url'
// import { dirname } from 'path';
import * as admin from 'firebase-admin'
import bucket from './config/firebaseAdmin.cjs'

try {
  dotenv.config()

  // Import required modules and packages

  dotenv.config()

  // const __filename = fileURLToPath(import.meta.url)
  // const __dirname = dirname(__filename)

  // // Replace with the path to your service account JSON file
  // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)

  // const firebaseConfig = {
  //   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  // }

  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount),
  //   storageBucket: firebaseConfig.storageBucket,
  // })

  // const bucket = admin.storage().bucket()

  // const __filename = fileURLToPath(import.meta.url)
  // const __dirname = dirname(__filename)
  // const require = createRequire(import.meta.url)

  // const serviceAccount = require('../analyzai-firebase-adminsdk-i35vb-60450401da.json')

  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount),
  //   storageBucket: firebaseConfig.storageBucket,
  // })

  // initializeApp(firebaseConfig)

  // await connectDB()

  // Firebase Admin SDK

  const app = express()

  const corsOptions = {
    origin: `${process.env.CLIENT_URL}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }

  app.use(cors(corsOptions))

  app.use(logger('dev'))

  app.use(cors())

  app.use(express.json())

  app.use('/', router)

  app.listen(process.env.PORT, () => {
    console.log(`Server running on PORT ${process.env.PORT} 🚀`)
  })
} catch (error) {
  console.log(error)
}
