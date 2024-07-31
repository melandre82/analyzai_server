import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  document_id: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  sourceDocuments: {
    type: Array,
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)
