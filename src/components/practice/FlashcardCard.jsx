/**
 * Flashcard Card Component
 * Card display with flip animation for flashcard mode
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Zap, SkipForward, Check, X, Loader2 } from 'lucide-react';
import Button from '@/components/common/Button';

/**
 * Flashcard Card Component
 * 
 * @param {Object} props
 * @param {string} props.sign - The sign letter
 * @param {boolean} props.revealed - Whether the answer is revealed
 * @param {Object} props.validationResult - Result from AI validation
 * @param {boolean} props.isValidating - Whether validation is in progress
 * @param {function} props.onValidate - Callback for validate action
 * @param {function} props.onReveal - Callback for reveal action
 * @param {function} props.onSkip - Callback for skip action
 * @param {number} props.cooldownRemaining - Seconds until next validation
 */
const FlashcardCard = ({
    sign,
    revealed,
    validationResult,
    isValidating,
    onValidate,
    onReveal,
    onSkip,
    cooldownRemaining = 0
}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Determine card state
    const isCorrect = validationResult?.isCorrect === true;
    const isIncorrect = validationResult?.isCorrect === false;
    const hasResult = validationResult !== null;

    // Handle reveal with flip animation
    const handleReveal = () => {
        setIsFlipped(true);
        onReveal?.();
    };

    return (
        <div className="perspective-1000">
            <motion.div
                className="relative w-full"
                animate={{
                    rotateY: isFlipped ? 180 : 0
                }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front of card (question) */}
                <motion.div
                    className={`
                        glass-card p-8 text-center backface-hidden
                        ${isCorrect ? 'border-2 border-success bg-success/5' : ''}
                        ${isIncorrect ? 'border-2 border-error bg-error/5' : ''}
                    `}
                    style={{ backfaceVisibility: 'hidden' }}
                    animate={isIncorrect ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                >
                    {/* Success confetti effect */}
                    <AnimatePresence>
                        {isCorrect && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-4 right-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                                    <Check className="w-6 h-6 text-success" />
                                </div>
                            </motion.div>
                        )}
                        {isIncorrect && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-4 right-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                                    <X className="w-6 h-6 text-error" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Prompt */}
                    <div className="text-sm text-dark-400 mb-2">Make this sign:</div>
                    <motion.div
                        key={sign}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-9xl font-bold gradient-text mb-6"
                    >
                        {sign}
                    </motion.div>

                    {/* Validation result feedback */}
                    {hasResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`
                                mb-6 p-4 rounded-xl
                                ${isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}
                            `}
                        >
                            <div className="text-lg font-bold mb-1">
                                {isCorrect ? '🎉 Correct!' : '❌ Not quite right'}
                            </div>
                            <div className="text-sm opacity-80">
                                Accuracy: {validationResult?.accuracy || 0}%
                            </div>
                            {validationResult?.feedback && (
                                <div className="text-sm mt-2 text-dark-300">
                                    {validationResult.feedback}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Action buttons */}
                    {!hasResult && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={onValidate}
                                disabled={isValidating || cooldownRemaining > 0}
                                leftIcon={
                                    isValidating
                                        ? <Loader2 className="w-5 h-5 animate-spin" />
                                        : <Zap className="w-5 h-5" />
                                }
                            >
                                {isValidating
                                    ? 'Checking...'
                                    : cooldownRemaining > 0
                                        ? `Wait ${cooldownRemaining}s`
                                        : 'Validate'
                                }
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                fullWidth
                                onClick={handleReveal}
                                leftIcon={<Eye className="w-5 h-5" />}
                            >
                                Reveal
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                fullWidth
                                onClick={onSkip}
                                leftIcon={<SkipForward className="w-5 h-5" />}
                            >
                                Skip
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* Back of card (revealed answer) - only shows when flipped */}
                {isFlipped && (
                    <motion.div
                        className="glass-card p-8 text-center absolute inset-0"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <div className="text-sm text-warning mb-2">
                            👀 Answer Revealed
                        </div>
                        <div className="text-7xl font-bold text-dark-100 mb-4">
                            {sign}
                        </div>
                        <p className="text-dark-400 text-sm mb-6">
                            This card is marked as "needs practice"
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setIsFlipped(false);
                                onSkip?.();
                            }}
                        >
                            Next Card
                        </Button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default FlashcardCard;
