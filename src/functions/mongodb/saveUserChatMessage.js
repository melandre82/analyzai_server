import { ChatMessage } from '../../../models/chat-message.js'

/**
 *
 * saveChatMessage - saves chat message to database
 *
 * @param uid - the user id
 * @param documentId - the document id
 * @param message - the user's message
 */
async function saveUserChatMessage (uid, documentId, message) {
  const timestamp = new Date().toISOString()
  const chatMessage = new ChatMessage({ user_id: uid, document_id: documentId, message, role: 'user' })
  await chatMessage.save()
}

export default saveUserChatMessage
