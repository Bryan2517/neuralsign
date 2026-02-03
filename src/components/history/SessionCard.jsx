/**
 * Session Card Component
 * Individual practice session display
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Target, Clock, Zap, Check, X } from 'lucide-react';

/**
 * Format timestamp
 */
const formatDate = (timestamp) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatTime = (timestamp) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Get mode display name and color
 */
const getModeInfo = (mode) => {
    switch (mode) {
        case 'free_practice':
            return { name: 'Free Practice', color: 'text-primary', bgColor: 'bg-primary/10' };
        case 'flashcard':
            return { name: 'Flashcard', color: 'text-accent', bgColor: 'bg-accent/10' };
        case 'timed_challenge':
            return { name: 'Timed Challenge', color: 'text-warning', bgColor: 'bg-warning/10' };
        case 'practice':
            return { name: 'Practice', color: 'text-secondary', bgColor: 'bg-secondary/10' };
        default:
            return { name: 'Practice', color: 'text-dark-300', bgColor: 'bg-dark-700' };
    }
};

/**
 * Session Card Component
 * 
 * @param {Object} props
 * @param {Object} props.session - Session data
 * @param {number} props.index - Index for animation delay
 */
const SessionCard = ({ session, index = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const modeInfo = getModeInfo(session.mode);
    const isSuccessful = session.accuracy >= 70;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card overflow-hidden"
        >
            {/* Main row */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-4 p-4 hover:bg-dark-700/30 transition-colors text-left"
            >
                {/* Sign icon */}
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl
                    ${isSuccessful
                        ? 'bg-success/10 text-success'
                        : 'bg-error/10 text-error'
                    }
                `}>
                    {session.sign || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-dark-100">
                            Letter {session.sign}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${modeInfo.bgColor} ${modeInfo.color}`}>
                            {modeInfo.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-dark-400">
                        <span>{formatDate(session.timestamp)}</span>
                        <span>{formatTime(session.timestamp)}</span>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className={`text-lg font-bold ${isSuccessful ? 'text-success' : 'text-error'}`}>
                            {session.accuracy || 0}%
                        </div>
                        <div className="text-xs text-dark-400">Accuracy</div>
                    </div>
                    <ChevronDown className={`
                        w-5 h-5 text-dark-400 transition-transform
                        ${isExpanded ? 'rotate-180' : ''}
                    `} />
                </div>
            </button>

            {/* Expanded details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-dark-700 overflow-hidden"
                    >
                        <div className="p-4 bg-dark-800/50">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center p-3 rounded-lg bg-dark-700/50">
                                    <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
                                    <div className="text-lg font-bold text-dark-100">
                                        {session.attempts || 1}
                                    </div>
                                    <div className="text-xs text-dark-400">Attempts</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-dark-700/50">
                                    <Check className="w-5 h-5 mx-auto mb-1 text-success" />
                                    <div className="text-lg font-bold text-dark-100">
                                        {session.accuracy || 0}%
                                    </div>
                                    <div className="text-xs text-dark-400">Accuracy</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-dark-700/50">
                                    <Zap className="w-5 h-5 mx-auto mb-1 text-warning" />
                                    <div className="text-lg font-bold text-dark-100">
                                        {session.bestStreak || '-'}
                                    </div>
                                    <div className="text-xs text-dark-400">Streak</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-dark-700/50">
                                    <Clock className="w-5 h-5 mx-auto mb-1 text-secondary" />
                                    <div className="text-lg font-bold text-dark-100">
                                        {session.duration ? `${session.duration}s` : '-'}
                                    </div>
                                    <div className="text-xs text-dark-400">Duration</div>
                                </div>
                            </div>

                            {/* Feedback if present */}
                            {session.feedback && (
                                <div className="mt-4 p-3 rounded-lg bg-dark-700/50">
                                    <div className="text-xs text-dark-400 mb-1">AI Feedback</div>
                                    <p className="text-sm text-dark-200">{session.feedback}</p>
                                </div>
                            )}

                            {/* Result indicator */}
                            <div className={`
                                mt-4 p-3 rounded-lg flex items-center gap-2
                                ${isSuccessful ? 'bg-success/10' : 'bg-error/10'}
                            `}>
                                {isSuccessful ? (
                                    <>
                                        <Check className="w-5 h-5 text-success" />
                                        <span className="text-success font-medium">Successful attempt</span>
                                    </>
                                ) : (
                                    <>
                                        <X className="w-5 h-5 text-error" />
                                        <span className="text-error font-medium">Needs more practice</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SessionCard;
