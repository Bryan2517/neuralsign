/**
 * ModelErrorState Component
 * Error state when 3D model fails to load
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * ModelErrorState Component
 * 
 * @param {string} message - Error message to display
 * @param {string} subMessage - Secondary helpful message
 * @param {function} onRetry - Callback function for retry button
 * @param {string} className - Additional CSS classes
 */
const ModelErrorState = memo(({
    message = 'Failed to load 3D model',
    subMessage = 'Please check your connection and try again',
    onRetry,
    className = '',
}) => {
    return (
        <div
            className={`
        flex flex-col items-center justify-center
        w-full h-full min-h-[300px]
        bg-dark-800 rounded-xl
        p-6 text-center
        ${className}
      `}
        >
            {/* Error Icon */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="p-4 rounded-full bg-error/10 mb-4"
            >
                <AlertTriangle className="w-10 h-10 text-error" />
            </motion.div>

            {/* Error Message */}
            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-semibold text-dark-100 mb-2"
            >
                {message}
            </motion.h3>

            {/* Sub Message */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-dark-400 mb-6 max-w-[280px]"
            >
                {subMessage}
            </motion.p>

            {/* Retry Button */}
            {onRetry && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        variant="primary"
                        onClick={onRetry}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Try Again
                    </Button>
                </motion.div>
            )}

            {/* Placeholder indicator */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-dark-500 mt-6"
            >
                Using placeholder model instead
            </motion.p>
        </div>
    );
});

ModelErrorState.displayName = 'ModelErrorState';

export default ModelErrorState;
