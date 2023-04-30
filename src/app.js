/* eslint-disable jsdoc/require-jsdoc */
import { OpenAI } from 'langchain/llms/openai'
import dotenv from 'dotenv'
import { createRequire } from 'module'
import { PdfLoader } from './dataloaders/pdfloader.js'
import { TextSplitter } from './textsplitter/textsplitter.js'
import { VectorConverter } from './database-interaction/vectorconverter.js'
import path from 'path'

createRequire(import.meta.url)

async function loadEnvironmentVariables() {
  dotenv.config({ path: '../.env' })
}

try {
  await loadEnvironmentVariables()

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

  const pdfLoader = new PdfLoader()
  const filePath = 'src/utbildningsplan-NGWEC-7.pdf'
  const absolutePath = path.resolve(filePath)

    const pdfText = await pdfLoader.load(`${absolutePath}`)

    const textString = JSON.stringify(pdfText)

//   console.log(await pdfLoader.load(`${absolutePath}`))

  const textSplitter = new TextSplitter()

  const documents = []

  const doc = await textSplitter.splitText(textString, 1000)

  documents.push(doc)

  const vectorConverter = new VectorConverter()

  for (const document of documents) {
    if (document !== null && document !== undefined) {
      await vectorConverter.index(document)
    }
  }

  vectorConverter.query('vad handlar denna pdf om?')
} catch (error) {
  console.log(error)
}
