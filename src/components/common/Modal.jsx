/**
 * Modal Component
 * Reusable modal with backdrop blur and animations
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-[90vw]',
};

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.15,
        },
    },
};

const Modal = ({
    isOpen,
    onClose,
    title = null,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    footer = null,
}) => {
    // Handle escape key
    const handleEscape = useCallback((event) => {
        if (event.key === 'Escape' && closeOnEscape) {
            onClose();
        }
    }, [closeOnEscape, onClose]);

    // Add/remove escape listener
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    // Handle backdrop click
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget && closeOnBackdrop) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop */}
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2 }}
                        onClick={handleBackdropClick}
                        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div
                        className="fixed inset-0 overflow-y-auto"
                        onClick={handleBackdropClick}
                    >
                        <div className="flex min-h-full items-center justify-center p-4">
                            {/* Modal */}
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={cn(
                                    'relative w-full rounded-2xl',
                                    'bg-dark-800 border border-dark-700',
                                    'shadow-2xl shadow-black/20',
                                    sizeClasses[size],
                                    className
                                )}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby={title ? 'modal-title' : undefined}
                            >
                                {/* Header */}
                                {(title || showCloseButton) && (
                                    <div className={cn(
                                        'flex items-center justify-between px-6 py-4',
                                        'border-b border-dark-700',
                                        headerClassName
                                    )}>
                                        {title && (
                                            <h2
                                                id="modal-title"
                                                className="text-lg font-semibold text-dark-100"
                                            >
                                                {title}
                                            </h2>
                                        )}

                                        {showCloseButton && (
                                            <button
                                                onClick={onClose}
                                                className={cn(
                                                    'p-1.5 rounded-lg transition-colors',
                                                    'text-dark-400 hover:text-dark-100',
                                                    'hover:bg-dark-700',
                                                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-800',
                                                    !title && 'ml-auto'
                                                )}
                                                aria-label="Close modal"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Body */}
                                <div className={cn('px-6 py-4', bodyClassName)}>
                                    {children}
                                </div>

                                {/* Footer */}
                                {footer && (
                                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-700">
                                        {footer}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
