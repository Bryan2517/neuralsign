/**
 * Firebase Configuration
 * Initialize Firebase app and export services
 * 
 * Note: Complete Firebase setup will be added in Part 2
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

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
const isConfigured = Object.values(firebaseConfig).some(value => value);

// Initialize Firebase (only if configured)
let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Initialize Analytics only in browser and if supported
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });

    console.log('🔥 Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured. Add credentials to .env file.');
}

export { app, auth, db, storage, analytics };
export default app;
