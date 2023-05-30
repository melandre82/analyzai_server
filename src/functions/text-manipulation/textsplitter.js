/* eslint-disable jsdoc/require-jsdoc */
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'

export class TextSplitter {
  async splitText(text, chunkSize, fileName) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: 200,
    })

    const metadatas = { filename: fileName || 'test' }

    return await splitter.createDocuments([text], [metadatas])
    // return await splitter.createDocuments({ pageContent: text })
  }
}
