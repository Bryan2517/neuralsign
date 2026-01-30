/**
 * Error Message Component
 * Display error messages with icons and dismiss functionality
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/helpers';

const severityConfig = {
    error: {
        icon: XCircle,
        containerClass: 'bg-error/10 border-error/30 text-error-100',
        iconClass: 'text-error',
    },
    warning: {
        icon: AlertTriangle,
        containerClass: 'bg-warning/10 border-warning/30 text-warning-100',
        iconClass: 'text-warning',
    },
    info: {
        icon: Info,
        containerClass: 'bg-primary/10 border-primary/30 text-primary-100',
        iconClass: 'text-primary',
    },
    alert: {
        icon: AlertCircle,
        containerClass: 'bg-secondary/10 border-secondary/30 text-secondary-100',
        iconClass: 'text-secondary',
    },
};

const ErrorMessage = ({
    message,
    title = null,
    severity = 'error',
    dismissible = true,
    onDismiss = null,
    className = '',
    children,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    const config = severityConfig[severity] || severityConfig.error;
    const Icon = config.icon;

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) {
            setTimeout(onDismiss, 200);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        'flex items-start gap-3 p-4 rounded-xl border',
                        config.containerClass,
                        className
                    )}
                    role="alert"
                >
                    {/* Icon */}
                    <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconClass)} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {title && (
                            <h4 className="font-semibold mb-1">{title}</h4>
                        )}

                        {message && (
                            <p className="text-sm opacity-90">{message}</p>
                        )}

                        {children && (
                            <div className="mt-2">{children}</div>
                        )}
                    </div>

                    {/* Dismiss button */}
                    {dismissible && (
                        <button
                            onClick={handleDismiss}
                            className={cn(
                                'flex-shrink-0 p-1 rounded-lg transition-colors',
                                'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20'
                            )}
                            aria-label="Dismiss message"
                        >
                            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ErrorMessage;
