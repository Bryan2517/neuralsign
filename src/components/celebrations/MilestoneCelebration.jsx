/**
 * Milestone Celebration Component
 * Full-screen celebration for major achievements
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Share2, Trophy, Flame, Award, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import Button from '@/components/common/Button';

// Milestone definitions
export const MILESTONES = {
    ALPHABET_COMPLETE: {
        id: 'alphabet_complete',
        title: '🎓 Alphabet Master!',
        subtitle: "You've learned all 26 letters of the ASL alphabet!",
        icon: '🔤',
        color: 'from-purple-500 to-pink-500',
        confettiColors: ['#8B5CF6', '#EC4899', '#6366F1']
    },
    LEVEL_10: {
        id: 'level_10',
        title: '🌟 Level 10!',
        subtitle: 'You reached double digits!',
        icon: '⭐',
        color: 'from-yellow-500 to-orange-500',
        confettiColors: ['#FFD700', '#FFA500', '#FFE135']
    },
    LEVEL_25: {
        id: 'level_25',
        title: '🏆 Level 25!',
        subtitle: "You're becoming an expert!",
        icon: '👑',
        color: 'from-amber-500 to-yellow-500',
        confettiColors: ['#FFD700', '#F59E0B', '#FCD34D']
    },
    STREAK_30: {
        id: 'streak_30',
        title: '🔥 30 Day Streak!',
        subtitle: 'A full month of dedication!',
        icon: '🏆',
        color: 'from-orange-500 to-red-500',
        confettiColors: ['#FF6B35', '#FF4500', '#FF8C00']
    },
    STREAK_100: {
        id: 'streak_100',
        title: '🚀 100 Day Streak!',
        subtitle: 'Legendary dedication!',
        icon: '💎',
        color: 'from-cyan-400 to-purple-500',
        confettiColors: ['#06B6D4', '#8B5CF6', '#EC4899']
    },
    FIRST_100_SIGNS: {
        id: 'first_100_signs',
        title: '💯 100 Signs Practiced!',
        subtitle: 'Century club member!',
        icon: '🎯',
        color: 'from-green-500 to-emerald-500',
        confettiColors: ['#10B981', '#22C55E', '#34D399']
    }
};

const MilestoneCelebration = ({
    isOpen,
    onClose,
    milestone, // MILESTONES key or custom object
    stats = {}, // Optional stats to display
    onShare
}) => {
    const hasTriggeredConfetti = useRef(false);

    const milestoneData = typeof milestone === 'string'
        ? MILESTONES[milestone]
        : milestone;

    // Trigger fireworks on open
    useEffect(() => {
        if (isOpen && !hasTriggeredConfetti.current && milestoneData) {
            hasTriggeredConfetti.current = true;
            triggerFireworks();
        }

        if (!isOpen) {
            hasTriggeredConfetti.current = false;
        }
    }, [isOpen, milestoneData]);

    const triggerFireworks = () => {
        const colors = milestoneData?.confettiColors || ['#6366F1', '#8B5CF6', '#EC4899'];
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            // Left side
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: {
                    x: randomInRange(0.1, 0.3),
                    y: Math.random() - 0.2
                },
                colors,
                ticks: 200
            });

            // Right side
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: {
                    x: randomInRange(0.7, 0.9),
                    y: Math.random() - 0.2
                },
                colors,
                ticks: 200
            });
        }, 250);
    };

    if (!isOpen || !milestoneData) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/95 backdrop-blur-lg"
            >
                {/* Background Animation */}
                <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: window.innerHeight + 100,
                                scale: Math.random() * 0.5 + 0.5
                            }}
                            animate={{
                                y: -100,
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: Math.random() * 3 + 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                            className="absolute text-4xl"
                        >
                            {['✨', '⭐', '🌟', '💫'][i % 4]}
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="relative w-full max-w-lg z-10"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-dark-700 text-dark-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Main Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-dark-800 to-dark-900 border border-white/10 shadow-2xl">
                        {/* Gradient Header */}
                        <div className={`h-2 bg-gradient-to-r ${milestoneData.color}`} />

                        {/* Content */}
                        <div className="p-8 text-center">
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                                className="relative inline-block mb-6"
                            >
                                {/* Glow */}
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`absolute inset-0 bg-gradient-to-r ${milestoneData.color} rounded-full blur-2xl`}
                                />

                                <div className={`
                  relative w-32 h-32 rounded-full
                  bg-gradient-to-br ${milestoneData.color}
                  flex items-center justify-center
                  shadow-2xl
                `}>
                                    <span className="text-6xl">{milestoneData.icon}</span>
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-bold text-white mb-2"
                            >
                                {milestoneData.title}
                            </motion.h2>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg text-dark-300 mb-6"
                            >
                                {milestoneData.subtitle}
                            </motion.p>

                            {/* Stats Grid */}
                            {Object.keys(stats).length > 0 && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-dark-700"
                                >
                                    {stats.signsLearned !== undefined && (
                                        <div className="text-center">
                                            <Award className="w-5 h-5 mx-auto text-primary mb-1" />
                                            <div className="text-2xl font-bold text-white">{stats.signsLearned}</div>
                                            <div className="text-xs text-dark-500">Signs Learned</div>
                                        </div>
                                    )}
                                    {stats.streak !== undefined && (
                                        <div className="text-center">
                                            <Flame className="w-5 h-5 mx-auto text-warning mb-1" />
                                            <div className="text-2xl font-bold text-white">{stats.streak}</div>
                                            <div className="text-xs text-dark-500">Day Streak</div>
                                        </div>
                                    )}
                                    {stats.accuracy !== undefined && (
                                        <div className="text-center">
                                            <Target className="w-5 h-5 mx-auto text-success mb-1" />
                                            <div className="text-2xl font-bold text-white">{stats.accuracy}%</div>
                                            <div className="text-xs text-dark-500">Accuracy</div>
                                        </div>
                                    )}
                                    {stats.totalXP !== undefined && (
                                        <div className="text-center">
                                            <Star className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                                            <div className="text-2xl font-bold text-white">{stats.totalXP.toLocaleString()}</div>
                                            <div className="text-xs text-dark-500">Total XP</div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex gap-3"
                            >
                                {onShare && (
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onShare}
                                        leftIcon={<Share2 className="w-4 h-4" />}
                                    >
                                        Share
                                    </Button>
                                )}
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={onClose}
                                >
                                    Continue
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MilestoneCelebration;
