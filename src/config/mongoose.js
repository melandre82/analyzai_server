import mongoose from 'mongoose'
import dotenv from 'dotenv'

/**
 * Establishes a connection to a database.
 *
 * @returns {Promise} Resolves to this if connection succeeded.
 */
export const connectDB = async () => {
  const { connection } = mongoose

  dotenv.config()

  // Bind connection to events (to get notifications).
  connection.on('connected', () => console.log('MongoDB connection opened.'))
  connection.on('error', (err) =>
    console.error(`MongoDB connection error occurred: ${err}`)
  )
  connection.on('disconnected', () => console.log('MongoDB is disconnected.'))

  // If the Node.js process ends, close the connection.
  process.on('SIGINT', () => {
    connection.close(() => {
      console.log('MongoDB disconnected due to application termination.')
      process.exit(0)
    })
  })

  mongoose.set('strictQuery', true)

  // const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING
  // Connect to the server.
  return mongoose.connect(process.env.DB_CONNECTION_STRING)
}
