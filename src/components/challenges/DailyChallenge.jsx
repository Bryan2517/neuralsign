/**
 * Daily Challenge Component
 * Daily rotating challenge to encourage regular practice
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Target,
    Timer,
    Zap,
    Trophy,
    CheckCircle,
    ChevronRight,
    Flame
} from 'lucide-react';

// Services
import { getTodayChallenge, getChallengeProgress } from '@/services/challengeService';

// Store
import useAuthStore from '@/store/authStore';

// Components
import Button from '@/components/common/Button';

/**
 * Daily Challenge Component
 */
const DailyChallenge = () => {
    const navigate = useNavigate();
    const { user, userData } = useAuthStore();
    const [challenge, setChallenge] = useState(null);
    const [progress, setProgress] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        // Get today's challenge
        const todayChallenge = getTodayChallenge();
        setChallenge(todayChallenge);

        // Check if user has completed it
        let completed = false;
        if (userData?.completedChallenges) {
            const completedToday = userData.completedChallenges.find(
                c => c.challengeId === todayChallenge.id
            );
            completed = !!completedToday;
            setIsCompleted(completed);
        }

        // Get progress if not completed
        if (user?.uid && !completed) {
            getChallengeProgress(user.uid, todayChallenge.id)
                .then(prog => {
                    setProgress(prog);
                    // Mark as completed if progress is 100%
                    if (prog >= 1) {
                        setIsCompleted(true);
                    }
                })
                .catch(console.error);
        }
    }, [user?.uid, userData?.completedChallenges]);

    if (!challenge) return null;

    // Get challenge icon based on type
    const getChallengeIcon = () => {
        switch (challenge.type) {
            case 'accuracy': return Target;
            case 'speed': return Timer;
            case 'streak': return Flame;
            case 'practice': return Zap;
            default: return Trophy;
        }
    };

    const ChallengeIcon = getChallengeIcon();

    // Get route based on challenge type
    const getChallengeRoute = () => {
        switch (challenge.type) {
            case 'speed':
                return '/practice/timed';
            case 'flashcard':
                return '/practice/flashcard';
            default:
                return '/practice/free';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                relative overflow-hidden rounded-2xl p-6
                ${isCompleted
                    ? 'bg-gradient-to-br from-success/20 to-success/5 border border-success/30'
                    : 'bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30'
                }
            `}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`
                    p-3 rounded-xl
                    ${isCompleted
                        ? 'bg-success/20'
                        : 'bg-gradient-to-br from-primary to-secondary'
                    }
                `}>
                    {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                    ) : (
                        <ChallengeIcon className="w-6 h-6 text-white" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-dark-400" />
                        <span className="text-sm text-dark-400">Today's Challenge</span>
                        {isCompleted && (
                            <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-medium rounded-full">
                                Completed!
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-dark-100 mb-1">
                        {challenge.title}
                    </h3>
                    <p className="text-sm text-dark-400 mb-4">
                        {challenge.description}
                    </p>

                    {/* Progress bar (if in progress) */}
                    {progress && progress > 0 && !isCompleted && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-dark-400 mb-1">
                                <span>Progress</span>
                                <span>{Math.round(progress * 100)}%</span>
                            </div>
                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress * 100}%` }}
                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Reward info */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 text-sm">
                            <Zap className="w-4 h-4 text-warning" />
                            <span className="text-dark-300">+{challenge.reward.xp} XP</span>
                        </div>
                        {challenge.reward.badge && (
                            <div className="flex items-center gap-1 text-sm">
                                <Trophy className="w-4 h-4 text-accent" />
                                <span className="text-dark-300">Special Badge</span>
                            </div>
                        )}
                    </div>

                    {/* Action button */}
                    {!isCompleted && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(getChallengeRoute())}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                            Start Challenge
                        </Button>
                    )}
                </div>
            </div>

            {/* Countdown to next challenge */}
            {isCompleted && (
                <div className="mt-4 pt-4 border-t border-dark-600/50 text-center">
                    <span className="text-sm text-dark-400">
                        New challenge in {getTimeUntilMidnight()}
                    </span>
                </div>
            )}
        </motion.div>
    );
};

/**
 * Get time remaining until midnight
 */
function getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
}

export default DailyChallenge;
