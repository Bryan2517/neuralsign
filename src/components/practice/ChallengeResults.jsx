/**
 * Challenge Results Component
 * End-of-challenge results display
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import {
    Trophy,
    Target,
    Zap,
    Flame,
    Clock,
    Star,
    RotateCcw,
    Home,
    Share2
} from 'lucide-react';
import Button from '@/components/common/Button';

/**
 * Performance Badge Component
 */
const PerformanceBadge = ({ score, isPersonalBest }) => {
    // Determine badge based on score
    const getBadge = () => {
        if (score >= 15) return { icon: '🏆', label: 'Amazing!', color: 'from-yellow-400 to-amber-500' };
        if (score >= 10) return { icon: '🌟', label: 'Great!', color: 'from-purple-400 to-pink-500' };
        if (score >= 5) return { icon: '👍', label: 'Good!', color: 'from-blue-400 to-indigo-500' };
        return { icon: '💪', label: 'Keep Going!', color: 'from-green-400 to-teal-500' };
    };

    const badge = getBadge();

    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="text-center"
        >
            <div className={`
                inline-flex items-center justify-center w-24 h-24 rounded-full mb-3
                bg-gradient-to-br ${badge.color}
            `}>
                <span className="text-5xl">{badge.icon}</span>
            </div>
            <div className="text-xl font-bold text-dark-100">{badge.label}</div>
            {isPersonalBest && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-warning/20 text-warning rounded-full text-sm font-medium"
                >
                    <Star className="w-4 h-4" />
                    New Personal Best!
                </motion.div>
            )}
        </motion.div>
    );
};

/**
 * Stat Card Component
 */
const StatCard = ({ icon: Icon, value, label, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-card p-4 text-center"
    >
        <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
        <div className="text-2xl font-bold text-dark-100">{value}</div>
        <div className="text-xs text-dark-400">{label}</div>
    </motion.div>
);

/**
 * Challenge Results Component
 * 
 * @param {Object} props
 * @param {Object} props.results - Challenge results
 * @param {number} props.results.score - Final score
 * @param {number} props.results.accuracy - Accuracy percentage
 * @param {number} props.results.bestStreak - Best streak achieved
 * @param {number} props.results.duration - Time taken (seconds)
 * @param {number} props.results.attempts - Total validation attempts
 * @param {boolean} props.results.isPersonalBest - Whether this is a new personal best
 * @param {number} props.results.personalBest - Previous personal best
 * @param {function} props.onRetry - Retry callback
 * @param {function} props.onExit - Exit callback
 */
const ChallengeResults = ({
    results,
    onRetry,
    onExit
}) => {
    const {
        score = 0,
        accuracy = 0,
        bestStreak = 0,
        duration = 60,
        attempts = 0,
        isPersonalBest = false,
        personalBest = 0
    } = results;

    // Calculate average time per sign
    const avgTimePerSign = score > 0 ? Math.round(duration / score) : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-lg mx-auto"
        >
            <div className="glass-card p-8">
                {/* Performance badge */}
                <PerformanceBadge score={score} isPersonalBest={isPersonalBest} />

                {/* Main score */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center my-8"
                >
                    <div className="text-sm text-dark-400 mb-2">Final Score</div>
                    <div className="text-7xl font-bold gradient-text">{score}</div>
                    <div className="text-dark-400">signs completed</div>
                    {personalBest > 0 && !isPersonalBest && (
                        <div className="text-sm text-dark-500 mt-2">
                            Personal best: {personalBest}
                        </div>
                    )}
                </motion.div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <StatCard
                        icon={Target}
                        value={`${accuracy}%`}
                        label="Accuracy"
                        color="text-success"
                        delay={0.3}
                    />
                    <StatCard
                        icon={Flame}
                        value={bestStreak}
                        label="Best Streak"
                        color="text-warning"
                        delay={0.35}
                    />
                    <StatCard
                        icon={Clock}
                        value={`${avgTimePerSign}s`}
                        label="Avg Time/Sign"
                        color="text-primary"
                        delay={0.4}
                    />
                    <StatCard
                        icon={Zap}
                        value={attempts}
                        label="Attempts"
                        color="text-secondary"
                        delay={0.45}
                    />
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={onRetry}
                        leftIcon={<RotateCcw className="w-5 h-5" />}
                    >
                        Try Again
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => {
                                // Share functionality (simplified)
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'NeuralSign Challenge',
                                        text: `I scored ${score} in NeuralSign's Timed Challenge with ${accuracy}% accuracy! 🤟`,
                                        url: window.location.origin
                                    });
                                }
                            }}
                            leftIcon={<Share2 className="w-4 h-4" />}
                        >
                            Share
                        </Button>
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={onExit}
                            leftIcon={<Home className="w-4 h-4" />}
                        >
                            Menu
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ChallengeResults;
