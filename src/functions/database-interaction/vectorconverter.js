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

export class VectorConverter {
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

    const uniqueDocs = []

    for (const doc of docs) {
      const contentHash = CryptoJS.SHA256(JSON.stringify(doc)).toString(
        CryptoJS.enc.Hex
      )
      try {
        const existingDoc = await DocumentIdentifier.findOne({ contentHash })
        if (!existingDoc) {
          // If the document is not found in MongoDB, it's considered unique
          uniqueDocs.push(doc)

          // Create a new DocumentModel instance and save it in MongoDB
          const newDocument = new DocumentIdentifier({
            hash: contentHash,
          })

          await newDocument.save()
        }
      } catch (error) {
        console.log('Error while checking for duplicates:', error)
      }
    }

    await PineconeStore.fromDocuments(uniqueDocs, new OpenAIEmbeddings(), {
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

    console.log('query: ' + query)

    /* Search the vector DB independently with meta filters */
    // const results = await vectorStore.similaritySearch('pinecone', 1, {
    //   foo: 'bar',
    // })
    // console.log(results)
    /*
    [
      Document {
        pageContent: 'pinecone is a vector db',
        metadata: { foo: 'bar' }
      }
    ]
    */

    /* Use as part of a chain (currently no metadata filters) */
    const model = new OpenAI()
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: true,
    })
    const response = await chain.call({ query: `${query}` })
    console.log(response)
  }
}
