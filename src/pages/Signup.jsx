/**
 * Signup Page
 * User registration form
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, User, UserPlus, ArrowRight, CheckCircle } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import useAuthStore from '@/store/authStore';
import { cn, isValidEmail, isValidPassword } from '@/utils/helpers';

const passwordRequirements = [
    { label: 'At least 8 characters', check: (p) => p.length >= 8 },
    { label: 'One uppercase letter', check: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', check: (p) => /[a-z]/.test(p) },
    { label: 'One number', check: (p) => /\d/.test(p) },
];

const Signup = () => {
    const navigate = useNavigate();
    const { signup, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setLocalError('');
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Validation
        if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (!isValidEmail(formData.email)) {
            setLocalError('Please enter a valid email address');
            return;
        }

        if (!isValidPassword(formData.password)) {
            setLocalError('Password does not meet requirements');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        try {
            await signup(formData.email, formData.password, formData.displayName);
            navigate('/learn');
        } catch (err) {
            console.error('Signup error:', err);
        }
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
                    <h1 className="text-2xl font-bold text-dark-100 mb-2">Create Account</h1>
                    <p className="text-dark-400">Start your sign language learning journey</p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {(localError || error) && (
                            <ErrorMessage
                                message={localError || error}
                                onDismiss={() => {
                                    setLocalError('');
                                    clearError();
                                }}
                            />
                        )}

                        {/* Display Name Field */}
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-dark-200 mb-2">
                                Display Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="text"
                                    id="displayName"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    className={cn(
                                        'w-full pl-10 pr-4 py-3 rounded-xl',
                                        'bg-dark-700/50 border border-dark-600',
                                        'text-dark-100 placeholder-dark-400',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                        'transition-all duration-200'
                                    )}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={cn(
                                        'w-full pl-10 pr-4 py-3 rounded-xl',
                                        'bg-dark-700/50 border border-dark-600',
                                        'text-dark-100 placeholder-dark-400',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                        'transition-all duration-200'
                                    )}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={cn(
                                        'w-full pl-10 pr-12 py-3 rounded-xl',
                                        'bg-dark-700/50 border border-dark-600',
                                        'text-dark-100 placeholder-dark-400',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                        'transition-all duration-200'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {formData.password && (
                                <div className="mt-3 space-y-1">
                                    {passwordRequirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                'flex items-center gap-2 text-xs',
                                                req.check(formData.password) ? 'text-success' : 'text-dark-400'
                                            )}
                                        >
                                            <CheckCircle className="w-3 h-3" />
                                            {req.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-200 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={cn(
                                        'w-full pl-10 pr-12 py-3 rounded-xl',
                                        'bg-dark-700/50 border border-dark-600',
                                        'text-dark-100 placeholder-dark-400',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                                        'transition-all duration-200',
                                        formData.confirmPassword && formData.password !== formData.confirmPassword && 'border-error'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isLoading}
                            leftIcon={<UserPlus className="w-5 h-5" />}
                        >
                            Create Account
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-dark-600" />
                        <span className="text-dark-400 text-sm">or</span>
                        <div className="flex-1 h-px bg-dark-600" />
                    </div>

                    {/* Google Sign Up (Placeholder) */}
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => console.log('Google sign up')}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            className="w-5 h-5 mr-2"
                        />
                        Continue with Google
                    </Button>
                </motion.div>

                {/* Login Link */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-6 text-dark-400"
                >
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-primary hover:text-primary-400 font-medium transition-colors inline-flex items-center gap-1"
                    >
                        Sign in <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.p>
            </div>
        </PageContainer>
    );
};

export default Signup;
