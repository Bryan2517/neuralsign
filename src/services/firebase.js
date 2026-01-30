/**
 * Firebase Configuration
 * Initialize Firebase app and export services
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

// Check for missing environment variables
const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingVars.length > 0) {
  console.error(
    '❌ Missing required Firebase environment variables:',
    missingVars.join(', ')
  );
  console.error('Please add these to your .env file');
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase config is properly set
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase (only if configured)
let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;
let googleProvider = null;

if (isConfigured) {
  try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);

    // Initialize Authentication
    auth = getAuth(app);

    // Initialize Firestore Database
    db = getFirestore(app);

    // Initialize Storage
    storage = getStorage(app);

    // Initialize Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });

    // Initialize Analytics only in browser and if supported
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('📊 Firebase Analytics initialized');
      }
    });

    console.log('🔥 Firebase initialized successfully');
    console.log(`📦 Project ID: ${firebaseConfig.projectId}`);
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
  }
} else {
  console.warn('⚠️ Firebase not configured. Add credentials to .env file.');
  console.warn('Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID');
}

export { app, auth, db, storage, analytics, googleProvider };
export default app;
