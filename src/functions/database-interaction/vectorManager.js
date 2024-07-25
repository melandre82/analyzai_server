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
    await this.#initialized

    const dbConfig = {
      pineconeIndex: this.#pineconeIndex,
      namespace: `${uid}`
    }

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      dbConfig
    )

    const model = new OpenAI({
      maxTokens: -1,
      streaming: true
    })

    const vectorStoreRetriever = vectorStore.asRetriever()

    const relevantDocs = await vectorStoreRetriever.invoke(query)

    const mapReduceChain = loadQAMapReduceChain(model)

    const message = await mapReduceChain.stream({
      question: query,
      input_documents: relevantDocs
    })

    // console.log(answer)
    return message
  }

  async queryWithStreaming (query, uid) {
    this.socket = getIo()
    await this.#initialized

    const dbConfig = {
      pineconeIndex: this.#pineconeIndex,
      namespace: `${uid}`
    }

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      dbConfig
    )

    const retriever = vectorStore.asRetriever()
    const documentRetrievalChain = RunnableSequence.from([
      (input) => input.query,
      retriever,
      formatDocumentsAsString
    ])

    // const context = await documentRetrievalChain.invoke(query)

    const input = {
      query,
      conversation_history: [],
      // context
    }

    // Document retrieval chain

    // Create LLM model
    const llmModel = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      temperature: 0,
      streaming: true
    })

    // const context1 = await documentRetrievalChain.invoke(input)

    // Create chat prompt template
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate('Answer the user\'s question. If you cannot find the answer within the context, just say I don\'t know.'),
      HumanMessagePromptTemplate.fromTemplate('{question}\nContext: {context}')
    ])

    const standaloneQuestionChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: (input) => input.context,
        question: (input) => input.query
      }),
      chatPrompt,
      new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        temperature: 0,
        verbose: true
      }),
      new StringOutputParser()
    ])

    // console.log('Context:', context1)

    // Create the OpenAI tools
    const retrievalChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        question: standaloneQuestionChain,
        original_message: (input) => input.query
      }),
      {
        context: documentRetrievalChain,
        question: (input) => input.original_message
      },
      {
        // Format the input for the llm model
        transform: async (input) => {
          // console.log('context1: ' + context1)

          const formattedMessages = await chatPrompt.formatMessages({
            question: input.query,
            context
          })
          return formattedMessages
        },
        run: llmModel
      },
      {
        content: (input) => {
          return input.output
        }
      }
    ])

    // Execute retrieval chain
    const stream = await retrievalChain.stream(input)

    const aiStream = LangChainAdapter.toAIStream(stream)

    // Respond with the stream
    console.log(new StreamingTextResponse(aiStream))
  }

  async deleteNamespace (uid) {
    await this.#initialized

    await this.#pineconeIndex.delete1({
      deleteAll: true,
      namespace: `${uid}`
    })
  }
}
