/**
 * Practice Menu Page
 * Central hub for all practice modes
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Infinity,
    Layers,
    Timer,
    Target,
    History,
    Flame,
    Trophy,
    ArrowRight,
    Sparkles
} from 'lucide-react';

// Components
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';
import DailyChallenge from '@/components/challenges/DailyChallenge';

// Store
import useAuthStore from '@/store/authStore';

/**
 * Practice Mode Card
 */
const PracticeModeCard = ({
    icon: Icon,
    iconColor,
    bgGradient,
    title,
    description,
    stats,
    onClick,
    disabled = false
}) => (
    <motion.div
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -4 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
            glass-card p-6 cursor-pointer transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-primary/10'}
        `}
        onClick={disabled ? undefined : onClick}
    >
        <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-semibold text-dark-100 mb-1">{title}</h3>
                <p className="text-sm text-dark-400">{description}</p>
            </div>
        </div>

        {stats && (
            <div className="flex items-center gap-4 mb-4 text-sm">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-dark-300">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span>{stat.value}</span>
                    </div>
                ))}
            </div>
        )}

        <div className="flex items-center justify-between">
            <span className="text-xs text-dark-500 uppercase tracking-wider">
                {disabled ? 'Coming Soon' : 'Start Practice'}
            </span>
            <ArrowRight className="w-5 h-5 text-dark-400" />
        </div>
    </motion.div>
);

/**
 * Quick Stats Sidebar
 */
const QuickStats = ({ userData }) => {
    const learnedCount = userData?.learnedSigns?.length || 0;
    const streak = userData?.progress?.streak || 0;
    const accuracy = userData?.progress?.accuracy || 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
        >
            <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warning" />
                Your Stats
            </h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-dark-400">Signs Learned</span>
                    <span className="text-xl font-bold text-primary">{learnedCount}/26</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(learnedCount / 26) * 100}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                </div>

                <div className="pt-4 border-t border-dark-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-warning" />
                            <span className="text-dark-400">Streak</span>
                        </div>
                        <span className="font-bold text-dark-100">{streak} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-success" />
                            <span className="text-dark-400">Accuracy</span>
                        </div>
                        <span className="font-bold text-dark-100">{accuracy}%</span>
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                fullWidth
                className="mt-4"
                onClick={() => window.location.href = '/progress'}
            >
                View Full Progress
            </Button>
        </motion.div>
    );
};

/**
 * Practice Menu Component
 */
const PracticeMenu = () => {
    const navigate = useNavigate();
    const { userData } = useAuthStore();
    const learnedCount = userData?.learnedSigns?.length || 0;

    const practiceModes = [
        {
            id: 'free',
            icon: Infinity,
            iconColor: 'text-white',
            bgGradient: 'from-indigo-500 to-purple-600',
            title: 'Free Practice',
            description: 'Practice any learned sign at your own pace. No pressure, no time limits.',
            route: '/practice/free',
            disabled: learnedCount === 0,
            stats: [
                { icon: Target, value: `${learnedCount} signs available`, color: 'text-success' }
            ]
        },
        {
            id: 'flashcard',
            icon: Layers,
            iconColor: 'text-white',
            bgGradient: 'from-pink-500 to-rose-600',
            title: 'Flashcard Mode',
            description: 'Quiz yourself with random signs. Validate, reveal, or skip.',
            route: '/practice/flashcard',
            disabled: learnedCount === 0,
            stats: [
                { icon: Layers, value: 'Random order', color: 'text-secondary' }
            ]
        },
        {
            id: 'timed',
            icon: Timer,
            iconColor: 'text-white',
            bgGradient: 'from-amber-500 to-orange-600',
            title: 'Timed Challenge',
            description: '60-second sprint! How many signs can you complete?',
            route: '/practice/timed',
            disabled: learnedCount < 3,
            stats: [
                { icon: Timer, value: '60 seconds', color: 'text-warning' }
            ]
        }
    ];

    return (
        <PageContainer>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                        <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Practice Modes</h1>
                        <p className="text-dark-400">Choose how you want to practice today</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main content - practice modes */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Daily Challenge */}
                    <DailyChallenge />

                    {/* Practice mode cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {practiceModes.map((mode, index) => (
                            <motion.div
                                key={mode.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.1 }}
                            >
                                <PracticeModeCard
                                    {...mode}
                                    onClick={() => navigate(mode.route)}
                                />
                            </motion.div>
                        ))}

                        {/* Practice History Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <PracticeModeCard
                                icon={History}
                                iconColor="text-white"
                                bgGradient="from-slate-500 to-slate-600"
                                title="Practice History"
                                description="Review your past practice sessions and track improvement."
                                onClick={() => navigate('/practice/history')}
                            />
                        </motion.div>
                    </div>

                    {/* No learned signs warning */}
                    {learnedCount === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card p-6 border border-warning/20 bg-warning/5"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-warning/10">
                                    <Sparkles className="w-5 h-5 text-warning" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-dark-100 mb-1">
                                        Learn some signs first!
                                    </h3>
                                    <p className="text-sm text-dark-400 mb-3">
                                        Practice modes require you to have learned at least one sign.
                                        Head to the Learn section to get started.
                                    </p>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => navigate('/learn')}
                                    >
                                        Start Learning
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar - Quick stats */}
                <div className="space-y-6">
                    <QuickStats userData={userData} />
                </div>
            </div>
        </PageContainer>
    );
};

export default PracticeMenu;
