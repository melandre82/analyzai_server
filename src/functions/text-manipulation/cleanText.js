/**
 * Clean text by removing all line breaks, tabs, form feeds, backspaces, null characters, and multiple spaces.
 *
 * @param {string} text - The text to clean
 * @returns {string} The cleaned text
 */
export function cleanText (text) {
  return text
    .replace(/\r|\n|\t|\f|\b|\0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
