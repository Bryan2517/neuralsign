/**
 * NeuralSign App
 * Main application component with routing and Firebase auth initialization
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';

// Layout Components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ResetPassword from '@/pages/ResetPassword';
import Learn from '@/pages/Learn';
import LetterDetail from '@/pages/LetterDetail';
import Practice from '@/pages/Practice';
import SentenceBuilder from '@/pages/SentenceBuilder';
import Progress from '@/pages/Progress';
import Profile from '@/pages/Profile';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';

// Store
import useAuthStore from '@/store/authStore';

// Console branding
console.log(`
  🧠 NeuralSign - Neural Networks Teaching Sign Language
  
  Built with ❤️ for KitaHack 2026
  Powered by Gemini AI, Three.js, and Firebase
  
  Status: Firebase Auth Integration Complete ✅
`);

/**
 * Global Loading Screen
 * Displayed during initial auth check
 */
const GlobalLoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="relative inline-block mb-6">
        <Brain className="w-20 h-20 text-primary" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-24 h-24 border-2 border-primary/20 border-t-primary rounded-full" />
        </motion.div>
      </div>
      <h1 className="text-2xl font-bold gradient-text mb-2">NeuralSign</h1>
      <p className="text-dark-400">Loading your experience...</p>
    </motion.div>
  </div>
);

/**
 * Auth Route Wrapper
 * Redirects to home if user is already authenticated
 */
const AuthRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Don't redirect while loading
  if (isLoading) {
    return children;
  }

  if (isAuthenticated) {
    return <Navigate to="/learn" replace />;
  }

  return children;
};

/**
 * App Layout
 * Wraps pages with Navbar and Footer
 */
const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

/**
 * Main App Component
 */
function App() {
  const { initAuth, isLoading } = useAuthStore();

  // Initialize Firebase auth listener on app mount
  useEffect(() => {
    console.log('🔄 Starting auth initialization...');
    initAuth();
  }, [initAuth]);

  // Show loading screen during initial auth check
  if (isLoading) {
    return <GlobalLoadingScreen />;
  }

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Auth Routes (redirect if already logged in) */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <Signup />
              </AuthRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthRoute>
                <ResetPassword />
              </AuthRoute>
            }
          />

          {/* Protected Routes (require authentication) */}
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/:lessonId"
            element={
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn/letter/:letter"
            element={
              <ProtectedRoute>
                <LetterDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sentence-builder"
            element={
              <ProtectedRoute>
                <SentenceBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
