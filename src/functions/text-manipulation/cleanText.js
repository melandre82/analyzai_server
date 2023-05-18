/* eslint-disable jsdoc/require-jsdoc */
export function cleanText(text) {
  return text
    .replace(/\r|\n|\t|\f|\b|\0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // .replace(/\\t/g, ' ') // Replace '\t' with a space
  // .replace(/\\r/g, '') // Replace '\r' with nothing
  // .replace(/\\n/g, ' ') // Replace '\n' with a space
  // .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
  // .trim()
}
