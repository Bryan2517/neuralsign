/**
 * NeuralSign Constants
 * Application-wide constants and configuration
 */

// Application Info
export const APP_NAME = 'NeuralSign';
export const APP_TAGLINE = 'Neural Networks Teaching Sign Language';
export const APP_VERSION = '1.0.0';

// Route Paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    LEARN: '/learn',
    LESSON: '/learn/:lessonId',
    PRACTICE: '/practice',
    SENTENCE_BUILDER: '/sentence-builder',
    PROGRESS: '/progress',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    NOT_FOUND: '*',
};

// Navigation Items
export const NAV_ITEMS = [
    { label: 'Home', path: ROUTES.HOME, icon: 'Home' },
    { label: 'Learn', path: ROUTES.LEARN, icon: 'GraduationCap' },
    { label: 'Practice', path: ROUTES.PRACTICE, icon: 'Hand' },
    { label: 'Sentence Builder', path: ROUTES.SENTENCE_BUILDER, icon: 'MessageSquare' },
    { label: 'Progress', path: ROUTES.PROGRESS, icon: 'TrendingUp' },
];

// Feature Flags
export const FEATURES = {
    ENABLE_3D_MODELS: true,
    ENABLE_AI_VALIDATION: true,
    ENABLE_CAMERA: true,
    ENABLE_GAMIFICATION: true,
    ENABLE_SOCIAL: false,
    ENABLE_OFFLINE_MODE: false,
};

// Learning Levels
export const LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
};

// Sign Categories
export const SIGN_CATEGORIES = {
    ALPHABET: 'alphabet',
    NUMBERS: 'numbers',
    GREETINGS: 'greetings',
    COMMON_WORDS: 'common_words',
    PHRASES: 'phrases',
    EMOTIONS: 'emotions',
    QUESTIONS: 'questions',
};

// Practice Modes
export const PRACTICE_MODES = {
    FLASHCARD: 'flashcard',
    QUIZ: 'quiz',
    CAMERA: 'camera',
    TIMED: 'timed',
};

// Achievement Types
export const ACHIEVEMENTS = {
    FIRST_SIGN: 'first_sign',
    ALPHABET_MASTER: 'alphabet_master',
    STREAK_7: 'streak_7',
    STREAK_30: 'streak_30',
    SPEED_DEMON: 'speed_demon',
    PERFECTIONIST: 'perfectionist',
};

// Animation Durations (ms)
export const ANIMATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    PAGE_TRANSITION: 400,
};

// Breakpoints (px)
export const BREAKPOINTS = {
    XS: 475,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
};

// Local Storage Keys
export const STORAGE_KEYS = {
    THEME: 'neuralsign_theme',
    USER_PREFERENCES: 'neuralsign_preferences',
    RECENT_SIGNS: 'neuralsign_recent_signs',
    OFFLINE_PROGRESS: 'neuralsign_offline_progress',
};

// API Endpoints (placeholders)
export const API = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
    GEMINI: {
        FEEDBACK: '/api/gemini/feedback',
        VALIDATE: '/api/gemini/validate',
    },
};

// MediaPipe Configuration
export const MEDIAPIPE = {
    MAX_HANDS: 2,
    MIN_DETECTION_CONFIDENCE: 0.7,
    MIN_TRACKING_CONFIDENCE: 0.5,
};

// 3D Model Settings
export const THREE_D = {
    CAMERA_FOV: 45,
    CAMERA_NEAR: 0.1,
    CAMERA_FAR: 1000,
    AMBIENT_LIGHT_INTENSITY: 0.5,
    DIRECTIONAL_LIGHT_INTENSITY: 1,
};

// Social Links
export const SOCIAL_LINKS = {
    GITHUB: 'https://github.com/yourusername/neuralsign',
    LINKEDIN: 'https://linkedin.com/in/yourprofile',
    TWITTER: 'https://twitter.com/yourhandle',
};

// Error Messages
export const ERRORS = {
    AUTH: {
        INVALID_EMAIL: 'Please enter a valid email address',
        WEAK_PASSWORD: 'Password must be at least 8 characters',
        USER_NOT_FOUND: 'No account found with this email',
        WRONG_PASSWORD: 'Incorrect password',
        EMAIL_IN_USE: 'An account with this email already exists',
        GENERIC: 'An error occurred during authentication',
    },
    NETWORK: {
        OFFLINE: 'You appear to be offline',
        TIMEOUT: 'Request timed out. Please try again',
        SERVER: 'Server error. Please try again later',
    },
    CAMERA: {
        NOT_FOUND: 'No camera found on this device',
        PERMISSION_DENIED: 'Camera permission denied',
        IN_USE: 'Camera is being used by another application',
    },
};

// Success Messages
export const SUCCESS = {
    AUTH: {
        LOGIN: 'Welcome back!',
        SIGNUP: 'Account created successfully!',
        LOGOUT: 'Logged out successfully',
        PASSWORD_RESET: 'Password reset email sent',
    },
    LEARNING: {
        SIGN_COMPLETED: 'Great job! Sign completed!',
        LESSON_COMPLETED: 'Lesson completed! 🎉',
        ACHIEVEMENT_UNLOCKED: 'Achievement unlocked! 🏆',
    },
};
