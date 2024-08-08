import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

/**
 *
 */
export class TextSplitter {
  /**
   * Splits text into chunks.
   *
   * @param {string} text - The text to split
   * @param {any} chunkSize - The size of the chunks
   * @param {string} fileName - The name of the file
   * @returns {Promise<any>} - The split text
   */
  async splitText (text, chunkSize, fileName) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: 200
    })

    const metadatas = { filename: fileName || 'test' }

    return await splitter.createDocuments([text], [metadatas])
  }
}
