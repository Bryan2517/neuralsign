/**
 * Button Component
 * Reusable button with multiple variants, sizes, and states
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

const buttonVariants = {
    primary: 'bg-primary hover:bg-primary-600 text-white shadow-glow hover:shadow-glow-lg',
    secondary: 'bg-secondary hover:bg-secondary-600 text-white shadow-glow hover:shadow-glow-lg',
    accent: 'bg-accent hover:bg-accent-600 text-white shadow-glow-accent',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-dark-300 hover:text-white hover:bg-dark-700',
    danger: 'bg-error hover:bg-error-600 text-white',
    success: 'bg-success hover:bg-success-600 text-white',
};

const buttonSizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3',
    icon: 'p-2',
    'icon-sm': 'p-1.5',
    'icon-lg': 'p-3',
};

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isDisabled = false,
    leftIcon = null,
    rightIcon = null,
    fullWidth = false,
    className = '',
    onClick,
    type = 'button',
    ...props
}, ref) => {
    const disabled = isDisabled || isLoading;

    return (
        <motion.button
            ref={ref}
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={cn(
                // Base styles
                'inline-flex items-center justify-center font-medium rounded-xl',
                'transition-all duration-200 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900',
                // Variant styles
                buttonVariants[variant],
                // Size styles
                buttonSizes[size],
                // State styles
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                fullWidth && 'w-full',
                // Custom classes
                className
            )}
            {...props}
        >
            {/* Loading spinner */}
            {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin" />
            )}

            {/* Left icon */}
            {!isLoading && leftIcon && (
                <span className="flex-shrink-0">{leftIcon}</span>
            )}

            {/* Button text */}
            {children && (
                <span>{children}</span>
            )}

            {/* Right icon */}
            {!isLoading && rightIcon && (
                <span className="flex-shrink-0">{rightIcon}</span>
            )}
        </motion.button>
    );
});

Button.displayName = 'Button';

export default Button;
