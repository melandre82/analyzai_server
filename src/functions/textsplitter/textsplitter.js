/* eslint-disable jsdoc/require-jsdoc */
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'

export class TextSplitter {
  async splitText(text, chunkSize) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: 200,
    })

    return await splitter.createDocuments([text])
  }
}
