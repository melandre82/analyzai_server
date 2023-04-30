/* eslint-disable jsdoc/require-jsdoc */
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'

export class PdfLoader {
  load (src) {
    const pdfLoader = new PDFLoader(src, { splitPages: false })

    const docs = pdfLoader.load()

    return docs
  }
}
