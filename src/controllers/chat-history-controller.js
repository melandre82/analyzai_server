import loadChatMessages from '../functions/mongodb/loadChatMessages.js'

/**
 *
 */
export class ChatHistoryController {
  /**
   * Gets chat history.
   *
   * @param {object} req the request object
   * @param {object} res the response object
   */
  async getChatHistory (req, res) {
    try {
      const uid = req.body.uid
      const documentId = req.body.documentId

      console.log(req.body)

      const chatMessages = await loadChatMessages(uid, documentId)

      console.log('chatMessages', chatMessages)

      res.status(200).json(chatMessages)
    } catch (error) {
      res.status(500).send({ error: error.message })
      console.log(error)
    }
  }
}
