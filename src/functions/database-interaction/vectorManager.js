/* eslint-disable jsdoc/require-jsdoc */
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import * as dotenv from 'dotenv'
import { getIo } from '../../socket.js'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate
} from '@langchain/core/prompts'
import {
  RunnableSequence
} from '@langchain/core/runnables'

import { formatDocumentsAsString } from 'langchain/util/document'
import { StringOutputParser } from '@langchain/core/output_parsers'
import saveAiChatMessage from '../mongodb/saveAiChatMessage.js'
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
    this.#initialized = true
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
    const dbConfig = {
      pineconeIndex: this.#pineconeIndex,
      namespace: `${uid}`
    }

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      dbConfig
    )

    const vectorStoreRetriever = vectorStore.asRetriever()

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      temperature: 0,
      streaming: true
    })

    // Create a system & human prompt for the chat model

    // from the langchain docs
    const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
  If you don't know the answer, just say that you don't know, don't try to make up an answer.
  ----------------
  {context}`
    const messages = [
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
      HumanMessagePromptTemplate.fromTemplate('{question}')
    ]
    const prompt = ChatPromptTemplate.fromMessages(messages)

    const chain = RunnableSequence.from([
      {
        // Extract the "question" field from the input object and pass it to the retriever as a string
        sourceDocuments: RunnableSequence.from([
          (input) => input.question,
          vectorStoreRetriever
        ]),
        question: (input) => input.question
      },
      {
        // Pass the source documents through unchanged so that we can return them directly in the final result
        sourceDocuments: (previousStepResult) => previousStepResult.sourceDocuments,
        question: (previousStepResult) => previousStepResult.question,
        context: (previousStepResult) =>
          formatDocumentsAsString(previousStepResult.sourceDocuments)
      },
      {
        result: prompt.pipe(model).pipe(new StringOutputParser()),
        sourceDocuments: (previousStepResult) => previousStepResult.sourceDocuments
      }
    ])

    const res = await chain.invoke({
      question: query
    })

    const returnMessage = (JSON.stringify(res, null, 2))

    return returnMessage
  }

  async queryWithStreaming (query, uid, currentFileName) {
    this.socket = getIo()

    console.log('current file name: ' + currentFileName)
    const dbConfig = {
      pineconeIndex: this.#pineconeIndex,
      namespace: `${uid}`,
      filter: { filename: `${currentFileName}` }
    }

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      dbConfig
    )

    const vectorStoreRetriever = vectorStore.asRetriever()

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      temperature: 0,
      streaming: true
    })

    // Create a system & human prompt for the chat model

    // from the langchain docs
    const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
  If you don't know the answer, just say that you don't know, don't try to make up an answer.
  ----------------
  {context}`
    const messages = [
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
      HumanMessagePromptTemplate.fromTemplate('{question}')
    ]
    const prompt = ChatPromptTemplate.fromMessages(messages)

    const chain = RunnableSequence.from([
      {
        // Extract the "question" field from the input object and pass it to the retriever as a string
        sourceDocuments: RunnableSequence.from([
          (input) => input.question,
          vectorStoreRetriever
        ]),
        question: (input) => input.question
      },
      {
        // Pass the source documents through unchanged so that we can return them directly in the final result
        sourceDocuments: (previousStepResult) => previousStepResult.sourceDocuments,
        question: (previousStepResult) => previousStepResult.question,
        context: (previousStepResult) =>
          formatDocumentsAsString(previousStepResult.sourceDocuments)
      },
      {
        result: prompt.pipe(model).pipe(new StringOutputParser()),
        sourceDocuments: (previousStepResult) => previousStepResult.sourceDocuments
      }
    ])

    const resStream = await chain.stream({
      question: query
    })

    // console.log('resStream:', resStream)

    const chunks = []
    for await (const chunk of resStream) {
      chunks.push(chunk)
      this.socket.emit('newToken', { type: 'server', token: chunk.result, currentFileName })
    }

    const message = chunks.map((chunk) => chunk.result).join('')

    const sourceDocuments = []

    for (const chunk of chunks) {
      if (chunk.sourceDocuments) {
        sourceDocuments.push(...chunk.sourceDocuments)
      }
    }

    // console.log(uid)
    // console.log(currentFileName)
    // console.log(aiMessage)
    // console.log(sourceDocuments)

    await saveAiChatMessage(
      uid,
      currentFileName,
      message,
      sourceDocuments
    )

    // console.log('aimessage: ' + aiMessage)
  }

  async deleteNamespace (uid) {
    try {
      // console.log('deleting namespace: ' + uid)
      await this.#initialized

      const index = this.#client.index(process.env.PINECONE_INDEX)

      await index.namespace(`${uid}`).deleteAll()
    } catch (error) {
      throw new Error(error)
    }
  }
}
