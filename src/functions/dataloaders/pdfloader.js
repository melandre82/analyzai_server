import { PDFLoader } from 'langchain/document_loaders/fs/pdf'

/**
 * PdfLoader class
 *
 */
export class PdfLoader {
  /**
   * Loads a pdf document.
   *
   * @param {any} src - the source of the pdf
   * @returns {Promise<any>} - the pdf document
   */
  async load (src) {
    const pdfLoader = new PDFLoader(src, { splitPages: false })

    const docs = pdfLoader.load()

    return docs
  }
}
