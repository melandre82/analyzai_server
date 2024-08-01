import loadChatMessages from '../functions/mongodb/loadChatMessages.js'

/**
 *
 */
export class ChatHistoryController {
  /**
   *
   * @param req
   * @param res
   */
  async getChatHistory (req, res) {
    try {
      const uid = req.body.uid
      const documentId = req.body.documentId

      console.log(req.body)
    //   console.log('uid', uid)
    //   console.log('documentId', documentId)

      const chatMessages = await loadChatMessages(uid, documentId)

      console.log('chatMessages', chatMessages)

      res.status(200).json(chatMessages)
    } catch (error) {
      res.status(500).send({ error: error.message })
      console.log(error)
    }
  }
}
