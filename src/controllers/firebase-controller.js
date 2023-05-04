/* eslint-disable jsdoc/require-jsdoc */

export class FirebaseController {
  receiveFile (req, res, next) {
    try {
      const file = req.file
      console.log('File uploaded:', file)
      res.json({ success: true, file })
    } catch (error) {
      console.error('File upload failed:', error)
      res
        .status(500)
        .json({ success: false, message: 'File upload failed', error })
    }
  }
}
