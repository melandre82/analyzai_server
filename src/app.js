import { OpenAI } from 'langchain/llms/openai'
import dotenv from 'dotenv'
import { createRequire } from 'module'

createRequire(import.meta.url)

dotenv.config()

try {
  const model = new OpenAI({
    openAIApiKey: `${process.env.OPENAI_API_KEY}`,
    temperature: 0.9,
  })

  const res = await model.call(
    'What would be a good company name a company that makes colorful socks?'
  )
  console.log(res)
} catch (error) {
  console.log(error)
}
