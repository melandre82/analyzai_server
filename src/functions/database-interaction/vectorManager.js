/* eslint-disable jsdoc/require-jsdoc */
import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings, OpenAI, ChatOpenAI } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import * as dotenv from 'dotenv'
// import { VectorDBQAChain } from 'langchain/chains'
import { getIo } from '../../socket.js'
import {
  PromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate
} from '@langchain/core/prompts'
import {
  RunnablePassthrough,
  RunnableSequence
  ,
  RunnableMap
} from '@langchain/core/runnables'
// import {
//   RunnablePassthrough,
//   RunnableSequence
// } from '@langchain/core/runnables'
// // import type { Document } from '@langchain/core/documents'
// import { StringOutputParser } from '@langchain/core/output_parsers'
import { loadQAMapReduceChain } from 'langchain/chains'
import { pull } from 'langchain/hub'
import { formatDocumentsAsString } from 'langchain/util/document'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents'
import { StreamingTextResponse, LangChainAdapter } from 'ai'

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

  async queryWithStreaming (query, uid) {
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

    const resStream = await chain.stream({
      question: query
    })

    console.log('resStream:', resStream)

    const chunks = []
    for await (const chunk of resStream) {
      chunks.push(chunk)
      console.log(`${chunk.result}`)
    }
  }

  async deleteNamespace (uid) {
    await this.#initialized

    await this.#pineconeIndex.delete1({
      deleteAll: true,
      namespace: `${uid}`
    })
  }
}
