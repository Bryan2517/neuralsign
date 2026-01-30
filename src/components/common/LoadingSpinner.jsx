/**
 * Loading Spinner Component
 * Animated loading indicator with brand colors
 */

import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

const spinnerVariants = {
    rotate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

const dotVariants = {
    pulse: {
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

const LoadingSpinner = ({
    size = 'md',
    centered = false,
    fullScreen = false,
    text = null,
    variant = 'spinner', // 'spinner' | 'dots' | 'neural'
    className = '',
}) => {
    const Wrapper = ({ children }) => {
        if (fullScreen) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm">
                    {children}
                </div>
            );
        }

        if (centered) {
            return (
                <div className="flex items-center justify-center w-full h-full min-h-[200px]">
                    {children}
                </div>
            );
        }

        return children;
    };

    // Standard spinner
    const SpinnerVariant = () => (
        <motion.div
            variants={spinnerVariants}
            animate="rotate"
            className={cn(
                'rounded-full border-2 border-dark-600',
                'border-t-primary border-r-secondary',
                sizeClasses[size]
            )}
        />
    );

    // Dots loading
    const DotsVariant = () => (
        <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    variants={dotVariants}
                    animate="pulse"
                    className={cn(
                        'rounded-full bg-gradient-to-r from-primary to-secondary',
                        size === 'sm' && 'w-1.5 h-1.5',
                        size === 'md' && 'w-2.5 h-2.5',
                        size === 'lg' && 'w-3.5 h-3.5',
                        size === 'xl' && 'w-5 h-5'
                    )}
                    style={{ animationDelay: `${i * 200}ms` }}
                />
            ))}
        </div>
    );

    // Neural network style loading
    const NeuralVariant = () => (
        <div className="relative">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className={cn('relative', sizeClasses[size])}
            >
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/30" />

                {/* Animated gradient ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="200"
                        strokeDashoffset="150"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="50%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center dot */}
                <motion.div
                    animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-primary"
                />
            </motion.div>
        </div>
    );

    const renderSpinner = () => {
        switch (variant) {
            case 'dots':
                return <DotsVariant />;
            case 'neural':
                return <NeuralVariant />;
            default:
                return <SpinnerVariant />;
        }
    };

    return (
        <Wrapper>
            <div className={cn('flex flex-col items-center gap-3', className)}>
                {renderSpinner()}

                {text && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-dark-400 font-medium"
                    >
                        {text}
                    </motion.p>
                )}
            </div>
        </Wrapper>
    );
};

export default LoadingSpinner;
