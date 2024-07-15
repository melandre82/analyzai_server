/* eslint-disable jsdoc/require-jsdoc */
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings, OpenAI } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import * as dotenv from 'dotenv'
import { VectorDBQAChain } from 'langchain/chains'
import { getIo } from '../../socket.js'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate
} from '@langchain/core/prompts'
import {
  RunnablePassthrough,
  RunnableSequence
} from '@langchain/core/runnables'
import { formatDocumentsAsString } from 'langchain/util/document'
import { StringOutputParser } from '@langchain/core/output_parsers'

dotenv.config()

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

  async query (query) {
    await this.#initialized
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex: this.#pineconeIndex }
    )

    const vectorStoreRetriever = vectorStore.asRetriever()

    const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
                              If you don't know the answer, just say that you don't know, don't try to make up an answer.
                              ----------------
                              {context}`

    const messages = [
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
      HumanMessagePromptTemplate.fromTemplate('{question}')
    ]
    const prompt = ChatPromptTemplate.fromMessages(messages)

    const model = new OpenAI({
      maxTokens: -1,
      streaming: true
    })

    const chain = RunnableSequence.from([
      {
        context: vectorStoreRetriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough()
      },
      prompt,
      model,
      new StringOutputParser()
    ])

    const answer = await chain.invoke(
      'say hello if you are receiving this'
    )

    console.log(answer)

    return answer

    // const results = await vectorStore.similaritySearch(`${query}`, 1, {
    // });
    // console.log(results);

    // const model = new OpenAI()

    // const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    //   k: 1,
    //   returnSourceDocuments: true
    // })
    // const response = await chain.call({ query: `${query}` })
    // return response
    // console.log(response)
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
