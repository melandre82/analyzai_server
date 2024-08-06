import { ChatMessage } from '../../../models/chat-message.js'

// Delete all chat messages with the given user id
/**
 *
 * @param uid
 */
async function deleteChatMessages (uid) {
  try {
    await ChatMessage.deleteMany({ user_id: uid })
  } catch (error) {
    console.error('Error deleting chat messages:', error)
    throw error
  }
}

export default deleteChatMessages
