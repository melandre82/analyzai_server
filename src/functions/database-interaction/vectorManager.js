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
// import type { Document } from '@langchain/core/documents'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { createRetrievalChain } from 'langchain/chains/retrieval'

(async () => {
  const langchain = await import('langchain')
})()

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

    const chain = createRetrievalChain(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true
    })

    const response = await chain.call({ query: `${query}` }, [
      {
        handleLLMNewToken: (token) => {
          this.socket.emit('newToken', { token, type: 'server' })
          console.log({ token, type: 'server' })
        }
      }
    ])

    console.log(response)

    // const chain = RunnableSequence.from([
    //   {
    //     // Extract the "question" field from the input object and pass it to the retriever as a string
    //     sourceDocuments: RunnableSequence.from([
    //       (input) => input.question,
    //       vectorStoreRetriever
    //     ]),
    //     question: (input) => input.question
    //   },
    //   {
    //     // Pass the source documents through unchanged so that we can return them directly in the final result
    //     sourceDocuments: (previousStepResult) => previousStepResult.sourceDocuments,
    //     question: (previousStepResult) => previousStepResult.question,
    //     context: (previousStepResult) =>
    //       formatDocumentsAsString(previousStepResult.sourceDocuments)
    //   },
    //   {
    //     result: prompt.pipe(model).pipe(new StringOutputParser()),
    //     sourceDocuments: (previousStepResult) => previousStepResult.sourceDocuments
    //   }
    // ])

    const res = await vectorStoreRetriever.invoke({
      question: query
    })

    console.log(res)

    // return answer

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
