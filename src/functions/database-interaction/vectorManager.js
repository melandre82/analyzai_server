/* eslint-disable jsdoc/require-jsdoc */
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings, OpenAI } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import * as dotenv from 'dotenv'
// import { VectorDBQAChain } from 'langchain/chains'
import { getIo } from '../../socket.js'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate
} from '@langchain/core/prompts'
// import {
//   RunnablePassthrough,
//   RunnableSequence
// } from '@langchain/core/runnables'
// // import type { Document } from '@langchain/core/documents'
// import { StringOutputParser } from '@langchain/core/output_parsers'
import { loadQAMapReduceChain } from 'langchain/chains'

import { createRetrievalChain } from 'langchain/chains/retrieval'

dotenv.config()

const formatDocumentsAsString = (documents) => {
  return documents.map((document) => document.pageContent).join('\n\n')
}
export class VectorManager {
  #client
  #pineconeIndex
  #initialized
  socket

  constructor () {
    this.#initialized = this.#init()
  }

  async #init () {
    this.#client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    })

    this.#pineconeIndex = this.#client.Index(process.env.PINECONE_INDEX)
  }

  async index (docs, uid) {
    await this.#initialized

    try {
      await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
        pineconeIndex: this.#pineconeIndex,
        namespace: `${uid}`
      })
    } catch (error) {
      console.log(error)
    }
  }

  async query (query, uid) {
    await this.#initialized
    console.log('from vectormanager: ' + uid)

    const dbConfig = {
      pineconeIndex: this.#pineconeIndex,
      namespace: `${uid}`
    }

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      dbConfig
    )



    console.log(vectorStore)

    const model = new OpenAI({
      maxTokens: -1,
      streaming: true
    })

    const vectorStoreRetriever = vectorStore.asRetriever()

    const relevantDocs = await vectorStoreRetriever.invoke(query)

    const mapReduceChain = loadQAMapReduceChain(model)

    const answer = await mapReduceChain.invoke({
      question: query,
      input_documents: relevantDocs
    })

    console.log(answer)
    return answer
  }

  async queryWithStreaming (query, uid) {
    this.socket = getIo()
    await this.#initialized
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex: this.#pineconeIndex, namespace: `${uid}` }
    )

    const model = new OpenAI({
      maxTokens: -1,
      streaming: true
    })

    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true
    })

    this.socket.emit('responseStart')

    const response = await chain.call({ query: `${query}` }, [
      {
        handleLLMNewToken: (token) => {
          this.socket.emit('newToken', { token, type: 'server' })
          console.log({ token, type: 'server' })
        }
      }
    ])
    // this.socket.emit('responseComplete')
    return response

    // console.log(response)
  }

  async deleteNamespace (uid) {
    await this.#initialized

    await this.#pineconeIndex.delete1({
      deleteAll: true,
      namespace: `${uid}`
    })
  }
}
