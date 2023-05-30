/* eslint-disable jsdoc/require-jsdoc */
// import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
// import PdfParse from 'pdf-parse'

// import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { BufferLoader } from 'langchain/document_loaders/fs/buffer'

export class PdfLoader {
  async load(src) {
    // Convert Buffer to Blob-like object
    const blobLikeObject = {
      arrayBuffer: () => Promise.resolve(Uint8Array.from(src).buffer)
    }

    const pdfLoader = new BufferLoader(blobLikeObject, { splitPages: false })

    const doc = await pdfLoader.load()

    return doc
  }
}

// pdfParser.js
