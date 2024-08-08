import { ChatMessage } from '../../../models/chat-message.js'

/**
 * Saves chat message to database.
 *
 * @param {string} uid - the user id
 * @param {string} documentId - the document id
 * @param {string} message - the ai's message
 * @param {Array} sourceDocuments - the source documents
 */
async function saveAiChatMessage (uid, documentId, message, sourceDocuments) {
  const chatMessage = new ChatMessage({ user_id: uid, document_id: documentId, message, role: 'ai', sourceDocuments })
  await chatMessage.save()
}

export default saveAiChatMessage
