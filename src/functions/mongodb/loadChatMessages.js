import { ChatMessage } from '../../../models/chat-message.js'

/**
 * Load chat messages from the database
 *
 * @param uid - user id
 * @param documentId - document id
 */
async function loadChatMessages (uid, documentId) {
  try {
    const chatMessages = await ChatMessage.find({ user_id: uid, document_id: documentId })
    return chatMessages
  } catch (error) {
    console.error('Error loading chat messages:', error)
    throw error
  }
}

export default loadChatMessages