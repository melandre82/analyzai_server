/* eslint-disable jsdoc/require-jsdoc */
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    validate: [
      {
        validator: (value) => {
          return value.trim().length > 0
        },
      },
    ],
  },
})

export const DocumentIdentifier = mongoose.model('documentIdentifier', schema)
