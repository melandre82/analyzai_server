import { Server } from 'socket.io'

let io = null

/**
 * Initializes the socket.io server.
 *
 * @param {object} server - The server object
 * @returns {object} The socket.io server
 */
export function initSocket (server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      }
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

/**
 * Gets the socket.io server.
 *
 * @returns {object} The socket.io server
 */
export function getIo () {
  if (io) {
    return io
  }
  throw new Error('Socket.io not initialized!')
}
