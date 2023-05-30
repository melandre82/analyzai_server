/* eslint-disable jsdoc/require-jsdoc */
import { PineconeClient } from '@pinecone-database/pinecone'
import * as dotenv from 'dotenv'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { VectorDBQAChain } from 'langchain/chains'
import { OpenAI } from 'langchain/llms/openai'
import CryptoJS from 'crypto-js'
import { DocumentIdentifier } from '../../../models/document-id.js'
import { getIo } from '../../socket.js'

dotenv.config()

export class VectorManager {
  #client
  #pineconeIndex
  #initialized
  socket

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

  async index(docs, uid) {
    await this.#initialized

    // for (const doc of docs) {
    //   doc.pageContent.replace((/\n/g, ' '))
    //   console.log(doc.metadata)
    // }

    await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      pineconeIndex: this.#pineconeIndex,
      namespace: `${uid}`,
    })
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

  async queryWithStreaming(query, uid) {
    this.socket = getIo()
    await this.#initialized
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex: this.#pineconeIndex, namespace: `${uid}` }
    )

    const model = new OpenAI({
      maxTokens: -1,
      streaming: true,
    })

    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    })

    this.socket.emit('responseStart')

    const response = await chain.call({ query: `${query}` }, [
      {
        handleLLMNewToken: (token) => {
          this.socket.emit('newToken', { token: token, type: 'server' })
          console.log({ token: token, type: 'server' })
        },
      },
    ])
    // this.socket.emit('responseComplete')
    return response

    // console.log(response)
  }

  async deleteNamespace(uid) {
    await this.#initialized

    await this.#pineconeIndex.delete1({
      deleteAll: true,
      namespace: `${uid}`,
    })
  }
}
