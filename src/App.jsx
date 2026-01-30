/**
 * NeuralSign App
 * Main application component with routing
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Learn from '@/pages/Learn';
import Practice from '@/pages/Practice';
import SentenceBuilder from '@/pages/SentenceBuilder';
import Progress from '@/pages/Progress';
import Profile from '@/pages/Profile';

// Store
import useAuthStore from '@/store/authStore';

// Console branding
console.log(`
  🧠 NeuralSign - Neural Networks Teaching Sign Language
  
  Built with ❤️ for KitaHack 2026
  Powered by Gemini AI, Three.js, and Firebase
  
  Status: Foundation Setup Complete ✅
`);

/**
 * Protected Route Wrapper
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show nothing while checking auth (or add a loading spinner)
  if (isLoading) {
    return null;
  }

  // For development, allow access even when not authenticated
  // TODO: Enable this check after Firebase is configured
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return children;
};

/**
 * Auth Route Wrapper
 * Redirects to home if user is already authenticated
 */
const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Auth Routes */}
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

          {/* Learning Routes */}
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

          {/* Practice Routes */}
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />

          {/* Sentence Builder */}
          <Route
            path="/sentence-builder"
            element={
              <ProtectedRoute>
                <SentenceBuilder />
              </ProtectedRoute>
            }
          />

          {/* Progress */}
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
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
