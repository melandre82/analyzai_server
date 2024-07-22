// npm install @pinecone-database/pinecone
import { Pinecone } from '@pinecone-database/pinecone'

import dotenv from 'dotenv'

dotenv.config()

/**
 *
 */
async function testUpsert () {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    const index = pc.index(process.env.PINECONE_INDEX)

    const description = await pc.describeIndex('testing')

    console.log(description)

    // await index.namespace('example-namespace').upsert([
    //   {
    //     id: 'vec1',
    //     values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
    //     sparseValues: {
    //       indices: [1, 5],
    //       values: [0.5, 0.5]
    //     },
    //     metadata: { genre: 'drama' }
    //   },
    //   {
    //     id: 'vec2',
    //     values: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    //     metadata: { genre: 'action' },
    //     sparseValues: {
    //       indices: [5, 6],
    //       values: [0.4, 0.5]
    //     }
    //   }
    // ])
  } catch (error) {
    console.error(error)
  }
}


testUpsert()