/**
 * Reset Password Page
 * Password reset request page
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, KeyRound } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import useAuthStore from '@/store/authStore';

const ResetPassword = () => {
    const { resetPassword, isLoading, error, clearError } = useAuthStore();

    const handleResetPassword = async (email) => {
        await resetPassword(email);
    };

    return (
        <PageContainer className="min-h-screen flex items-center justify-center py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <Brain className="w-10 h-10 text-primary" />
                        <span className="text-2xl font-bold gradient-text">NeuralSign</span>
                    </Link>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <KeyRound className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-dark-100 mb-2">Reset Password</h1>
                    <p className="text-dark-400">We'll help you get back into your account</p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-8"
                >
                    <ResetPasswordForm
                        onSubmit={handleResetPassword}
                        isLoading={isLoading}
                        error={error}
                        onClearError={clearError}
                    />
                </motion.div>
            </div>
        </PageContainer>
    );
};

export default ResetPassword;
