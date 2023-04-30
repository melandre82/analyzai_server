import { OpenAI } from 'langchain/llms/openai'
import dotenv from 'dotenv'
import { createRequire } from 'module'
import { PdfLoader } from '../dataloaders/pdfloader.js'
import path from 'path'

createRequire(import.meta.url)

dotenv.config()

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
