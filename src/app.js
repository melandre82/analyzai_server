/* eslint-disable jsdoc/require-jsdoc */
import { OpenAI } from 'langchain/llms/openai'
import dotenv from 'dotenv'
import { createRequire } from 'module'
import { PdfLoader } from './dataloaders/pdfloader.js'
import { TextSplitter } from './textsplitter/textsplitter.js'
import { VectorConverter } from './vectorconverter/vectorconverter.js'
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

  console.log(await pdfLoader.load(`${absolutePath}`))

  const textSplitter = new TextSplitter()

  const text = `Hi.\n\nI'm Harrison.\n\nHow? Are? You?\nOkay then f f f f.
  This is a weird text to write, but gotta test the splittingggg some how.\n\n
  Bye!\n\n-H.`

  console.log(await textSplitter.splitText(text, 20))

  const documents = []

  const doc = await textSplitter.splitText(text, 20)

  documents.push(doc)

  const vectorConverter = new VectorConverter()

  for (const document of documents) {
    if (document !== null) {
      await vectorConverter.convert(document)
    }
  }
} catch (error) {
  console.log(error)
}
