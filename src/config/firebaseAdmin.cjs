// firebaseAdmin.cjs
const admin = require('firebase-admin')
const serviceAccount = require('../../analyzai-firebase-adminsdk-i35vb-60450401da.json')

const firebaseConfig = {
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: firebaseConfig.storageBucket,
})

const bucket = admin.storage().bucket()

module.exports = bucket