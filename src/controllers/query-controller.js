import { VectorManager } from '../functions/database-interaction/vectorManager.js'
import { getIo } from '../socket.js'
import saveUserChatMessage from '../functions/mongodb/saveUserChatMessage.js'

const vectorManager = new VectorManager()

/**
 *
 */
export class QueryController {
  /**
   * Queries the database.
   *
   * @param {object} req the request object
   * @param {object} res the response object
   */
  async query (req, res) {
    try {
      const query = req.body.query

      const uid = req.body.uid

      const currentFileName = req.body.currentFileName

      await saveUserChatMessage(uid, currentFileName, query)

      const io = getIo()

      const results = await vectorManager.queryWithStreaming(query, uid, currentFileName)
      io.emit('hello', results)

      res.status(200).json(results)
    } catch (error) {
      res.status(500).send({ error: error.message })
      console.log(error)
    }
  }
}
