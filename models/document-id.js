import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    validate: [
      {
        /**
         * Validates that the hash is a string of at least one character.
         *
         * @param {string} value The value to validate
         * @returns {string} The validation result
         */
        validator: (value) => {
          return value.trim().length > 0
        }
      }
    ]
  }
})

export const DocumentIdentifier = mongoose.model('documentIdentifier', schema)
