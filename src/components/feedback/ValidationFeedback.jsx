/**
 * ValidationFeedback Component
 * Displays the validation result after Gemini analyzes a hand sign
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Lightbulb,
    RefreshCw,
    ChevronRight,
    Loader2,
    Sparkles,
    Hand
} from 'lucide-react';
import Button from '../common/Button';
import AccuracyMeter from './AccuracyMeter';

/**
 * Confetti particle component
 */
const ConfettiParticle = ({ delay, color }) => (
    <motion.div
        initial={{
            y: -20,
            x: Math.random() * 200 - 100,
            opacity: 1,
            scale: 0
        }}
        animate={{
            y: 300,
            x: Math.random() * 300 - 150,
            opacity: 0,
            scale: 1,
            rotate: Math.random() * 720 - 360
        }}
        transition={{
            duration: 2 + Math.random(),
            delay: delay,
            ease: 'easeOut'
        }}
        className="absolute top-0 left-1/2 w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
    />
);

/**
 * Confetti effect for correct answers
 */
const Confetti = ({ show }) => {
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
    const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)]
    }));

    return (
        <AnimatePresence>
            {show && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {particles.map(particle => (
                        <ConfettiParticle
                            key={particle.id}
                            delay={particle.delay}
                            color={particle.color}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
};

/**
 * ValidationFeedback Component
 * 
 * @param {Object} props
 * @param {Object} props.result - Validation result from Gemini
 * @param {boolean} props.isValidating - Whether validation is in progress
 * @param {string} props.targetLetter - The target letter being practiced
 * @param {Function} props.onTryAgain - Callback for try again button
 * @param {Function} props.onNext - Callback for next letter button
 * @param {number} props.cooldownRemaining - Seconds until next validation allowed
 */
const ValidationFeedback = memo(({
    result = null,
    isValidating = false,
    targetLetter = 'A',
    onTryAgain,
    onNext,
    cooldownRemaining = 0
}) => {
    const [showConfetti, setShowConfetti] = useState(false);

    // Trigger confetti on correct answer
    useEffect(() => {
        if (result?.isCorrect) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [result]);

    // IDLE state
    if (!result && !isValidating) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 text-center"
            >
                <div className="p-4 rounded-full bg-dark-700 inline-block mb-4">
                    <Hand className="w-8 h-8 text-dark-400" />
                </div>
                <h3 className="text-lg font-semibold text-dark-200 mb-2">
                    Ready to Practice
                </h3>
                <p className="text-dark-400 text-sm">
                    Make the sign for letter <span className="text-primary font-bold">{targetLetter}</span> and tap Validate
                </p>
            </motion.div>
        );
    }

    // VALIDATING state
    if (isValidating) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 text-center border-primary/30"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    className="p-4 rounded-full bg-primary/10 inline-block mb-4"
                >
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </motion.div>
                <h3 className="text-lg font-semibold text-dark-200 mb-2">
                    Analyzing Your Sign...
                </h3>
                <p className="text-dark-400 text-sm">
                    AI is checking your hand position
                </p>
            </motion.div>
        );
    }

    // CORRECT state
    if (result.isCorrect) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 border-success/30 relative overflow-hidden"
            >
                <Confetti show={showConfetti} />

                <div className="relative z-10">
                    {/* Success icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        className="flex justify-center mb-4"
                    >
                        <div className="p-3 rounded-full bg-success/20">
                            <CheckCircle className="w-12 h-12 text-success" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-success text-center mb-2"
                    >
                        Correct! 🎉
                    </motion.h3>

                    {/* Accuracy meter */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center my-6"
                    >
                        <AccuracyMeter accuracy={result.accuracy} isAnimated={true} />
                    </motion.div>

                    {/* Feedback */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-dark-300 text-center mb-6"
                    >
                        {result.feedback}
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-3"
                    >
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={onNext}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                            Next Letter
                        </Button>
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={onTryAgain}
                            leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                            Practice Again
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    // INCORRECT state
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 border-warning/30"
        >
            {/* Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="flex justify-center mb-4"
            >
                <div className="p-3 rounded-full bg-warning/20">
                    <XCircle className="w-12 h-12 text-warning" />
                </div>
            </motion.div>

            {/* Title */}
            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-warning text-center mb-2"
            >
                Keep Trying!
            </motion.h3>

            {/* Accuracy meter */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center my-6"
            >
                <AccuracyMeter accuracy={result.accuracy} isAnimated={true} />
            </motion.div>

            {/* Feedback */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-dark-300 text-center mb-4"
            >
                {result.feedback}
            </motion.p>

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-dark-800 rounded-xl p-4 mb-6"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-dark-200">Tips to improve:</span>
                    </div>
                    <ul className="space-y-2">
                        {result.suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className="text-sm text-dark-400 flex items-start gap-2"
                            >
                                <Sparkles className="w-3 h-3 text-secondary mt-1 flex-shrink-0" />
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Try again button */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Button
                    variant="primary"
                    fullWidth
                    onClick={onTryAgain}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    disabled={cooldownRemaining > 0}
                >
                    {cooldownRemaining > 0
                        ? `Wait ${cooldownRemaining}s...`
                        : 'Try Again'
                    }
                </Button>
            </motion.div>
        </motion.div>
    );
});

ValidationFeedback.displayName = 'ValidationFeedback';

export default ValidationFeedback;
