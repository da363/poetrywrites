// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" → name it "poetrywrites"
// 3. Go to Project Settings → General → scroll down → "Add app" → Web (</>)
// 4. Copy your firebaseConfig object and paste it below
// 5. Go to Authentication → Sign-in method → Enable "Google"
// 6. Go to Firestore Database → Create database → Start in production mode
// 7. Go to Firestore → Rules → paste the rules from FIRESTORE_RULES.txt
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ── PASTE YOUR FIREBASE CONFIG HERE ──────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyCEV4Rzyb8AYU5eSkfJTfbFoM78kYYwnZU",
    authDomain: "poetrywrites-b6394.firebaseapp.com",
    projectId: "poetrywrites-b6394",
    storageBucket: "poetrywrites-b6394.firebasestorage.app",
    messagingSenderId: "406553699780",
    appId: "1:406553699780:web:b082eff58eafa667e93091",
    measurementId: "G-MWCP8H5KN8"
};
// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const provider = new GoogleAuthProvider()

// Admin email — only this account gets admin access
export const ADMIN_EMAILS = ['davidbabak14@gmail.com', 'alumnzube4@gmail.com']