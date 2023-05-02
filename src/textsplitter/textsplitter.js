/* eslint-disable jsdoc/require-jsdoc */
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'

export class TextSplitter {
  //   textSplitter

  //   constructor() {
  //     this.textSplitter = new RecursiveCharacterTextSplitter({
  //       chunkSize: 1000,
  //       chunkOverlap: 200,
  //     })
  //   }

  //   async split(text) {
  //     // return await this.textSplitter.splitDocuments([
  //     //   new Document({ pageContent: text })
  //     // ])
  //     return await this.textSplitter.createDocuments([text])
  //   }

  async splitText(text, chunkSize) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: 200,
    })

    return await splitter.createDocuments([text])
  }
}
