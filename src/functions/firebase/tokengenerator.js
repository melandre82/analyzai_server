/* eslint-disable jsdoc/require-jsdoc */
import admin from 'firebase-admin'
import dotenv from 'dotenv'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../config/firebase.js'

dotenv.config()

await initializeApp(firebaseConfig)

dotenv.config()

export async function generateCustomToken() {
  const serverId = process.env.FIREBASE_SERVER_UID
  const customToken = await admin.auth().createCustomToken(serverId)
  return customToken
}

export async function authorizeWithCustomToken(customToken) {
  const auth = getAuth()
  await signInWithCustomToken(auth, customToken)
}
