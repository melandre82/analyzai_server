import { PDFExtract } from 'pdf.js-extract'

/**
 * Parses a PDF buffer.
 *
 * @param {any} buffer - The file buffer
 * @returns {Promise<string>} - The text content of the PDF
 */
export async function parsePdf (buffer) {
  const pdfExtract = new PDFExtract()
  const options = {}

  return new Promise((resolve, reject) => {
    pdfExtract.extractBuffer(buffer, options, (err, data) => {
      if (err) return reject(err)

      const textPages = data.pages.map((page) => {
        return page.content.map((item) => item.str).join('')
      })

      resolve(textPages.join(''))
    })
  })
}
