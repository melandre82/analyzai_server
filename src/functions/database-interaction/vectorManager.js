/* eslint-disable jsdoc/require-jsdoc */
import { PineconeClient } from '@pinecone-database/pinecone'
import * as dotenv from 'dotenv'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { VectorDBQAChain } from 'langchain/chains'
import { OpenAI } from 'langchain/llms/openai'
import CryptoJS from 'crypto-js'
import { DocumentIdentifier } from '../../../models/document-id.js'

dotenv.config()

export class VectorManager {
  #client
  #pineconeIndex
  #initialized

  constructor() {
    this.#initialized = this.#init()
  }

  async #init() {
    this.#client = new PineconeClient()
    await this.#client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    })
    this.#pineconeIndex = this.#client.Index(process.env.PINECONE_INDEX)
  }

  async index(docs) {
    await this.#initialized

    for (const doc of docs) {
      doc.pageContent.replace((/\n/g, ' '))
      console.log(doc.metadata)
    }

    await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      pineconeIndex: this.#pineconeIndex,
    })
    // await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    //   pineconeIndex: this.#pineconeIndex,
    // })
  }

  async query(query) {
    await this.#initialized
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex: this.#pineconeIndex }
    )

    const model = new OpenAI()

    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    })
    const response = await chain.call({ query: `${query}` })
    return response
    // console.log(response)
  }

  async queryWithStreaming(query) {
    await this.#initialized
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex: this.#pineconeIndex }
    )

    const model = new OpenAI({
      maxTokens: -1,
      streaming: true,
    })

    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    })
    const response = await chain.call({ query: `${query}` }, [
      {
        handleLLMNewToken(token) {
          console.log({ token })
        },
      },
    ])
    return response
    // console.log(response)
  }
}
