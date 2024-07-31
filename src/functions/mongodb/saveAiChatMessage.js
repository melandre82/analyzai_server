import { ChatMessage } from '../../../models/chat-message.js'

/**
 *
 * saveChatMessage - saves chat message to database
 *
 * @param uid - the user id
 * @param documentId - the document id
 * @param message - the ai's message
 * @param sourceDocuments - the source documents
 */
async function saveAiChatMessage (uid, documentId, message, sourceDocuments) {
  const timestamp = new Date().toISOString()
  const chatMessage = new ChatMessage({ user_id: uid, document_id: documentId, message, role: 'ai', sourceDocuments })
  await chatMessage.save()
}

export default saveAiChatMessage
