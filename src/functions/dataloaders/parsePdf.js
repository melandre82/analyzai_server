import PDFParser from 'pdf2json'

export function parsePdf(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1)

    pdfParser.on('pdfParser_dataError', (errData) =>
      reject(errData.parserError)
    )
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      resolve(pdfParser.getRawTextContent())
    })

    pdfParser.parseBuffer(buffer)
  })
}