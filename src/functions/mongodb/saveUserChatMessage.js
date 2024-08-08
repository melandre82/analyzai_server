import { ChatMessage } from '../../../models/chat-message.js'

/**
 * Saves a user's chat message to database.
 *
 * @param {string} uid - the user id
 * @param {string} documentId - the document id
 * @param {string} message - the user's message
 */
async function saveUserChatMessage (uid, documentId, message) {
  const chatMessage = new ChatMessage({ user_id: uid, document_id: documentId, message, role: 'user' })
  await chatMessage.save()
}

export default saveUserChatMessage
