/**
 * Progress Page
 * Track learning progress, achievements, and streaks
 * Enhanced with real data and charts
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Flame,
    Trophy,
    Target,
    Clock,
    Zap,
    BookOpen,
    Award,
    ChevronRight
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import StatsCard from '@/components/progress/StatsCard';
import AccuracyChart from '@/components/progress/AccuracyChart';
import LearningProgressChart from '@/components/progress/LearningProgressChart';
import ActivityHeatmap from '@/components/progress/ActivityHeatmap';
import LearningPath from '@/components/learning/LearningPath';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Services
import { getUserAchievements } from '@/services/database';

// Store
import useAuthStore from '@/store/authStore';

// Data
import { alphabetSigns } from '@/data/signsData';

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
    { id: 'first_sign', name: 'First Sign', description: 'Complete your first sign', icon: '🎯' },
    { id: 'alphabet_master', name: 'Alphabet Master', description: 'Learn all 26 letters', icon: '🔤' },
    { id: 'week_warrior', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥' },
    { id: 'quick_learner', name: 'Quick Learner', description: 'Complete 5 signs in one session', icon: '⚡' },
    { id: 'perfect_score', name: 'Perfect Score', description: 'Get 100% accuracy on a sign', icon: '💯' },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete timed challenge quickly', icon: '🏎️' },
];

/**
 * Sign Mastery Grid Component
 */
const SignMasteryGrid = ({ learnedSigns = [], practiceHistory = [] }) => {
    // Calculate mastery level for each letter
    const masteryLevels = useMemo(() => {
        const levels = {};

        alphabetSigns.forEach(sign => {
            const sessions = practiceHistory.filter(s => s.sign === sign.letter);
            const isLearned = learnedSigns.includes(sign.letter);

            if (!isLearned) {
                levels[sign.letter] = 0; // Not learned
            } else if (sessions.length === 0) {
                levels[sign.letter] = 1; // Just learned
            } else {
                const avgAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length;
                if (avgAccuracy >= 90) levels[sign.letter] = 4; // Mastered
                else if (avgAccuracy >= 70) levels[sign.letter] = 3; // Proficient
                else if (avgAccuracy >= 50) levels[sign.letter] = 2; // Learning
                else levels[sign.letter] = 1; // Needs practice
            }
        });

        return levels;
    }, [learnedSigns, practiceHistory]);

    const getMasteryColor = (level) => {
        switch (level) {
            case 4: return 'bg-success text-white';
            case 3: return 'bg-primary text-white';
            case 2: return 'bg-secondary/50 text-white';
            case 1: return 'bg-warning/30 text-warning';
            default: return 'bg-dark-700 text-dark-500';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-dark-100">Sign Mastery</h3>
                </div>
                <span className="text-sm text-dark-400">
                    {learnedSigns.length}/26 learned
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-13 gap-1 mb-4">
                {alphabetSigns.map((sign, idx) => (
                    <motion.div
                        key={sign.letter}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.35 + idx * 0.02 }}
                        className={`
                            aspect-square rounded flex items-center justify-center
                            text-xs font-bold transition-all cursor-default
                            ${getMasteryColor(masteryLevels[sign.letter])}
                        `}
                        title={`${sign.letter}: ${['Not learned', 'Needs practice', 'Learning', 'Proficient', 'Mastered'][masteryLevels[sign.letter]]}`}
                    >
                        {sign.letter}
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-dark-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-dark-700" />
                    <span>Not learned</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-warning/30" />
                    <span>Needs practice</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-secondary/50" />
                    <span>Learning</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span>Proficient</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-success" />
                    <span>Mastered</span>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Achievements Section Component
 */
const AchievementsSection = ({ unlockedAchievements = [] }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    <h3 className="font-semibold text-dark-100">Achievements</h3>
                </div>
                <span className="text-sm text-dark-400">
                    {unlockedAchievements.length}/{ACHIEVEMENT_DEFINITIONS.length} unlocked
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
                    const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);

                    return (
                        <motion.div
                            key={achievement.id}
                            whileHover={{ scale: 1.05 }}
                            className={`
                                p-3 rounded-xl text-center transition-all
                                ${isUnlocked
                                    ? 'bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30'
                                    : 'bg-dark-700/50 border border-dark-600 opacity-50'
                                }
                            `}
                        >
                            <div className={`text-2xl mb-1 ${isUnlocked ? '' : 'grayscale'}`}>
                                {achievement.icon}
                            </div>
                            <h4 className="text-xs font-medium text-dark-200 mb-0.5 truncate">
                                {achievement.name}
                            </h4>
                            <p className="text-[10px] text-dark-400 line-clamp-2">
                                {achievement.description}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

/**
 * Progress Page Component
 */
const Progress = () => {
    const navigate = useNavigate();
    const { user, userData, isLoading } = useAuthStore();
    const [achievements, setAchievements] = useState([]);

    // Load achievements
    useEffect(() => {
        if (user?.uid) {
            getUserAchievements(user.uid)
                .then(setAchievements)
                .catch(console.error);
        }
    }, [user?.uid]);

    // Extract user data
    const learnedSigns = userData?.learnedSigns || [];
    const practiceHistory = userData?.practiceHistory || [];
    const streak = userData?.progress?.streak || 0;
    const accuracy = userData?.progress?.accuracy || 0;
    const totalXP = userData?.progress?.totalXP || 0;

    // Calculate practice time (estimate based on sessions, ~2 min per session)
    const practiceMinutes = useMemo(() => {
        return practiceHistory.length * 2;
    }, [practiceHistory]);

    // Calculate trend (compare last 7 days to previous 7 days)
    const accuracyTrend = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const recentSessions = practiceHistory.filter(s => {
            const date = s.timestamp?.toDate?.() || new Date(s.timestamp);
            return date >= weekAgo;
        });

        const olderSessions = practiceHistory.filter(s => {
            const date = s.timestamp?.toDate?.() || new Date(s.timestamp);
            return date >= twoWeeksAgo && date < weekAgo;
        });

        if (olderSessions.length === 0) return 0;

        const recentAvg = recentSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / recentSessions.length || 0;
        const olderAvg = olderSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / olderSessions.length || 0;

        return Math.round(((recentAvg - olderAvg) / (olderAvg || 1)) * 100);
    }, [practiceHistory]);

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner text="Loading your progress..." />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-success/10">
                        <TrendingUp className="w-8 h-8 text-success" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-dark-100">Your Progress</h1>
                        <p className="text-dark-400">Track your learning journey and achievements</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/practice/menu')}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                        Practice Now
                    </Button>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    icon={Target}
                    iconColor="text-success"
                    bgColor="from-success/20 to-success/5"
                    label="Signs Learned"
                    value={learnedSigns.length}
                    subValue="/ 26"
                    delay={0}
                />
                <StatsCard
                    icon={Award}
                    iconColor="text-primary"
                    bgColor="from-primary/20 to-primary/5"
                    label="Accuracy"
                    value={`${accuracy}%`}
                    trend={accuracyTrend}
                    delay={0.05}
                />
                <StatsCard
                    icon={Flame}
                    iconColor="text-warning"
                    bgColor="from-warning/20 to-warning/5"
                    label="Current Streak"
                    value={streak}
                    subValue="days"
                    delay={0.1}
                />
                <StatsCard
                    icon={Clock}
                    iconColor="text-secondary"
                    bgColor="from-secondary/20 to-secondary/5"
                    label="Practice Time"
                    value={practiceMinutes}
                    subValue="mins"
                    delay={0.15}
                />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <AccuracyChart data={practiceHistory} height={220} />
                <LearningProgressChart
                    practiceHistory={practiceHistory}
                    learnedSigns={learnedSigns}
                    height={220}
                />
            </div>

            {/* Activity Heatmap */}
            <div className="mb-6">
                <ActivityHeatmap practiceHistory={practiceHistory} days={90} />
            </div>

            {/* Bottom Row: Mastery + Learning Path */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <SignMasteryGrid
                    learnedSigns={learnedSigns}
                    practiceHistory={practiceHistory}
                />
                <LearningPath learnedSigns={learnedSigns} />
            </div>

            {/* Achievements */}
            <AchievementsSection unlockedAchievements={achievements} />
        </PageContainer>
    );
};

export default Progress;
