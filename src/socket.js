/* eslint-disable jsdoc/require-jsdoc */
import { Server } from 'socket.io'

let io = null

export function initSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
    })

    io.on('connection', (socket) => {
      console.log('socket.io: a user connected')

      socket.on('disconnect', () => {
        console.log('socket.io: a user disconnected')
      })
    })
  }

  return io
}

export function getIo() {
  if (io) {
    return io
  }
  throw new Error('Socket.io not initialized!')
}
