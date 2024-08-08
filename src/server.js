import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/mongoose.js'
import logger from 'morgan'
import { router } from './routes/router.js'
import cors from 'cors'

// import { dirname } from 'path';
import { initSocket } from './socket.js'

try {
  dotenv.config()

  await connectDB()

  dotenv.config()

  const app = express()

  const corsOptions = {
    origin: `${process.env.CLIENT_URL}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }

  console.log('CORS is allowing: ', process.env.CLIENT_URL)

  app.use(cors(corsOptions))

  app.use(logger('dev'))

  app.use(cors())

  app.use(express.json())

  app.use(express.urlencoded({ extended: false }))

  app.use('/', router)

  app.use((req, res, next) => {
    next()
  })

  const server = app.listen(process.env.PORT, () => {
    console.log(`Server running on PORT ${process.env.PORT} 🚀`)
  })

  initSocket(server)
} catch (error) {
  console.log(error)
}
