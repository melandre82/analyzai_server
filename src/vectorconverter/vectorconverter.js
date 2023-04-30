/* eslint-disable jsdoc/require-jsdoc */
import { PineconeClient } from '@pinecone-database/pinecone'
import * as dotenv from 'dotenv'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

dotenv.config()

export class VectorConverter {
  async convert(docs) {
    const client = new PineconeClient()
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    })
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX)
    await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      pineconeIndex
    })
  }
}
