/* eslint-disable jsdoc/require-jsdoc */
import { OpenAI } from 'langchain/llms/openai'
import dotenv from 'dotenv'
import { createRequire } from 'module'
import { PdfLoader } from './functions/dataloaders/pdfloader.js'
import { TextSplitter } from './functions/text-manipulation/textsplitter.js'
import { VectorManager } from './functions/database-interaction/vectorManager.js'
import path from 'path'
import { connectDB } from './config/mongoose.js'
import { cleanText } from './functions/text-manipulation/cleanText.js'

createRequire(import.meta.url)

async function loadEnvironmentVariables() {
  dotenv.config({ path: '../.env' })
}

try {
  await loadEnvironmentVariables()
  // await connectDB()

  // dotenv.config()

  // try {
  //   const model = new OpenAI({
  //     openAIApiKey: `${process.env.OPENAI_API_KEY}`,
  //     temperature: 0.9,
  //   })

  //   const res = await model.call(
  //     'What would be a good company name a company that makes colorful socks?'
  //   )
  //   console.log(res)
  // } catch (error) {
  //   console.log(error)
  // }

  // const pdfLoader = new PdfLoader()
  // const filePath = 'uploads/1683154124729-1683146090114-porsche.pdf'
  // const absolutePath = path.resolve(filePath)

  // const pdfText = await pdfLoader.load(`${absolutePath}`)

  // console.log(cleanText('History \r\nOrigin \r\nFerdinand Porsche (1875–1951) founded the company'))

  // const textSplitter = new TextSplitter()

  // const doc = await textSplitter.splitText(textString, 1000)

  // console.log(doc)

  // const vectorConverter = new VectorConverter()

  // await vectorConverter.index(doc)

  // vectorConverter.query('give a summary of the history of porsche')

  // To enable streaming, we pass in `streaming: true` to the LLM constructor.
  // Additionally, we pass in a handler for the `handleLLMNewToken` event.
  // const chat = new OpenAI({
  //   maxTokens: 25,
  //   streaming: true,
  // })

  // const response = await chat.call('Tell me a joke.', undefined, [
  //   {
  //     handleLLMNewToken(token) {
  //       console.log({ token })
  //     },
  //   },
  // ])
  // console.log(response)

  // const vectorManager = new VectorManager()

  // const query = 'What is the history of Porsche?'

  // console.log(await vectorManager.queryWithStreaming(query))
} catch (error) {
  console.log(error)
}
