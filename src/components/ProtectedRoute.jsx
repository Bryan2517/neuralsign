/**
 * Protected Route Component
 * Wraps routes that require authentication
 * 
 * Redirects to login page if user is not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';

/**
 * Loading Screen Component
 * Displayed while checking authentication status
 */
const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
        >
            <div className="relative inline-block mb-4">
                <Brain className="w-16 h-16 text-primary" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Loader2 className="w-20 h-20 text-primary/30" />
                </motion.div>
            </div>
            <p className="text-dark-400 text-sm">Loading your profile...</p>
        </motion.div>
    </div>
);

/**
 * Protected Route Wrapper
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    // Show loading screen while checking auth status
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        console.log('🔒 Access denied, redirecting to login');
        // Save the attempted URL to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is authenticated, render the protected content
    return children;
};

export default ProtectedRoute;
