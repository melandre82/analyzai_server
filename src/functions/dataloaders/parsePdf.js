/* eslint-disable jsdoc/require-jsdoc */

import { PDFExtract } from 'pdf.js-extract'

export async function parsePdf(buffer) {
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

