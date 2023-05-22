/* eslint-disable jsdoc/require-jsdoc */
import { Server } from 'socket.io'

export class Socket {
  #io

  constructor(server) {
    this.#init(server)
  }

  #init(server) {
    if (!this.#io) {
      this.#io = new Server(server, {
        cors: {
          origin: process.env.CLIENT_URL,
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: true,
        },
      })
      this.#io.on('connection', (socket) => {
        console.log('socket.io: a user connected')

        socket.on('disconnect', () => {
          console.log('socket.io: a user disconnected')
        })
      })
    }
  }

  getIO() {
    if (!this.#io) {
      throw new Error('Socket.io not initialized!')
    }

    return this.#io
  }
}
