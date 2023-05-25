/* eslint-disable jsdoc/require-jsdoc */

import { VectorManager } from '../functions/database-interaction/vectorManager.js'
// import { Socket } from '../socket.js'
import { getIo } from '../socket.js'

const vectorManager = new VectorManager()

// const socket = new Socket()

export class QueryController {
  async query(req, res) {
    try {
      const query = req.body.query

      const uid = req.body.uid

      const io = getIo()


      // io.emit('hello', 'hello bitch ass')

      // const results = await vectorManager.query(query)

      const results = await vectorManager.queryWithStreaming(query, uid)

      io.emit('hello', results)

      //   console.log(results)

      console.log(JSON.stringify(results, null, 2))


      res.status(200).json(results)
    } catch (error) {
      res.status(500).send({ error: error.message })
      console.log(error)
    }
  }
}
