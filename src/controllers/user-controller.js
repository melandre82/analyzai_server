import { FileController } from './file-controller.js'
import { VectorManager } from '../functions/database-interaction/vectorManager.js'
import deleteChatMessages from '../functions/mongodb/deleteChatMessages.js'
import admin from 'firebase-admin'

/**
 * The UserController class.
 *
 */
export class UserController {
  /**
   * Deletes a user.
   *
   * @param {object} req the request object
   * @param {object} res the response object
   */
  async deleteUser (req, res) {
    try {
      const fileController = new FileController()
      await fileController.deleteUserFiles(req, res)
    } catch (error) {
      res.status(500).send({ error: error.message })
      console.log(error)
    }
    try {
      const uid = req.body.uid
      await admin.auth().deleteUser(uid)
      const vectorManager = new VectorManager()
      await vectorManager.deleteNamespace(uid)
      await deleteChatMessages(uid)
      res.status(200).send({ success: true })
    } catch (error) {
      res.status(500).send({ error: error.message })
      console.log(error)
    }
  }
}
