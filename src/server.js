import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/mongoose.js'
import logger from 'morgan'
import { router } from './routes/router.js'

try {
  dotenv.config()

  await connectDB()

  const app = express()

  app.use(logger('dev'))

  app.use(express.json())

  app.use('/', router)

  app.listen(process.env.PORT, () => {
    console.log(`Server running on PORT ${process.env.PORT} 🚀`)
  })
} catch (error) {
  console.log(error)
}
