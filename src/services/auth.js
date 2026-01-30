/**
 * Authentication Service
 * Firebase authentication functions for NeuralSign
 * 
 * Handles user signup, signin, Google auth, password reset, and profile updates
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { createUserProfile, getUserProfile, updateUserProfile as updateDbProfile } from './database';

/**
 * Firebase Auth Error Messages
 * Maps Firebase error codes to user-friendly messages
 */
const AUTH_ERROR_MESSAGES = {
    'auth/email-already-in-use': 'This email address is already registered. Please sign in or use a different email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use at least 8 characters with letters and numbers.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
};

/**
 * Get user-friendly error message from Firebase error
 * @param {Error} error - Firebase error object
 * @returns {string} User-friendly error message
 */
function getAuthErrorMessage(error) {
    const code = error.code || '';
    return AUTH_ERROR_MESSAGES[code] || error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Sign up new user with email and password
 * Creates Firebase auth account and Firestore user profile
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<Object>} User object
 */
export async function signUp(email, password, displayName) {
    try {
        console.log('🔐 Creating new user account:', email);

        // Create Firebase auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, { displayName });

        // Create user document in Firestore
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            photoURL: null,
            progress: {
                totalSigns: 0,
                accuracy: 0,
                streak: 0,
                lastPractice: null,
                level: 1,
            },
            learnedSigns: [],
            practiceHistory: [],
            achievements: [],
            sentences: [],
        };

        await createUserProfile(user.uid, userData);

        console.log('✅ User account created successfully:', user.uid);

        return {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            photoURL: user.photoURL,
        };
    } catch (error) {
        console.error('❌ Sign up error:', error.code, error.message);
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Sign in user with email and password
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
export async function signIn(email, password) {
    try {
        console.log('🔐 Signing in user:', email);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✅ User signed in successfully:', user.uid);

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        };
    } catch (error) {
        console.error('❌ Sign in error:', error.code, error.message);
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Sign in with Google
 * Creates Firestore profile if new user
 * 
 * @returns {Promise<Object>} User object with isNewUser flag
 */
export async function signInWithGoogle() {
    try {
        console.log('🔐 Starting Google sign-in...');

        if (!googleProvider) {
            throw new Error('Google sign-in is not configured. Please check Firebase setup.');
        }

        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user profile exists in Firestore
        const existingProfile = await getUserProfile(user.uid);
        let isNewUser = false;

        if (!existingProfile) {
            // Create new user profile for Google sign-in
            console.log('📝 Creating Firestore profile for new Google user');
            isNewUser = true;

            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'User',
                photoURL: user.photoURL,
                progress: {
                    totalSigns: 0,
                    accuracy: 0,
                    streak: 0,
                    lastPractice: null,
                    level: 1,
                },
                learnedSigns: [],
                practiceHistory: [],
                achievements: [],
                sentences: [],
            };

            await createUserProfile(user.uid, userData);
        }

        console.log('✅ Google sign-in successful:', user.uid);

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isNewUser,
        };
    } catch (error) {
        console.error('❌ Google sign-in error:', error.code, error.message);
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Sign out current user
 * 
 * @returns {Promise<void>}
 */
export async function logOut() {
    try {
        console.log('🔐 Signing out user...');
        await signOut(auth);
        console.log('✅ User signed out successfully');
    } catch (error) {
        console.error('❌ Sign out error:', error.code, error.message);
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Send password reset email
 * 
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
    try {
        console.log('🔐 Sending password reset email to:', email);
        await sendPasswordResetEmail(auth, email);
        console.log('✅ Password reset email sent successfully');
    } catch (error) {
        console.error('❌ Password reset error:', error.code, error.message);
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Update user profile
 * Updates both Firebase Auth profile and Firestore document
 * 
 * @param {Object} updates - Profile updates { displayName?, photoURL? }
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUserProfile(updates) {
    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error('No user is currently signed in.');
        }

        console.log('🔐 Updating user profile:', updates);

        // Update Firebase Auth profile
        await updateProfile(user, updates);

        // Update Firestore document
        await updateDbProfile(user.uid, updates);

        console.log('✅ Profile updated successfully');

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        };
    } catch (error) {
        console.error('❌ Profile update error:', error.code || error.message);
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * Get current user
 * 
 * @returns {Object|null} Current Firebase user object or null
 */
export function getCurrentUser() {
    return auth?.currentUser || null;
}

/**
 * Subscribe to auth state changes
 * 
 * @param {Function} callback - Callback function receiving user object
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
    if (!auth) {
        console.warn('⚠️ Auth not initialized, returning empty unsubscribe');
        return () => { };
    }

    return onAuthStateChanged(auth, callback);
}
