// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import firebase from 'firebase/compat/app'
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'analyzai.firebaseapp.com',
  projectId: 'analyzai',
  storageBucket: 'analyzai.appspot.com',
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const storage = getStorage(app)

export { storage, firebase as default }
