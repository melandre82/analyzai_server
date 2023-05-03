import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/mongoose.js'
import logger from 'morgan'
import { router } from './routes/router.js'
import cors from 'cors'

try {
  dotenv.config()

  await connectDB()

  const app = express()

  const corsOptions = {
    origin: `${process.env.CLIENT_URL}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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
