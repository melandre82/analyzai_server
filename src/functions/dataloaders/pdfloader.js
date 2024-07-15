/* eslint-disable jsdoc/require-jsdoc */
// import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
// import PdfParse from 'pdf-parse'

import { PDFLoader } from 'langchain/document_loaders/fs/pdf'

export class PdfLoader {
  async load (src) {
    const pdfLoader = new PDFLoader(src, { splitPages: false })

    const docs = pdfLoader.load()

    return docs
  }
}

// pdfParser.js


