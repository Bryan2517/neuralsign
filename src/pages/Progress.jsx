/**
 * Progress Page
 * Track learning progress, achievements, and streaks
 */

import { motion } from 'framer-motion';
import { TrendingUp, Flame, Trophy, Target, Calendar, Clock, Star, Zap } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

const stats = [
    { label: 'Current Streak', value: '0', unit: 'days', icon: Flame, color: 'text-warning' },
    { label: 'Total XP', value: '0', unit: 'xp', icon: Zap, color: 'text-primary' },
    { label: 'Signs Learned', value: '0', unit: 'signs', icon: Target, color: 'text-success' },
    { label: 'Practice Time', value: '0', unit: 'mins', icon: Clock, color: 'text-secondary' },
];

const achievements = [
    { id: 1, name: 'First Sign', description: 'Complete your first sign', icon: '🎯', unlocked: false },
    { id: 2, name: 'Alphabet Master', description: 'Learn all 26 letters', icon: '🔤', unlocked: false },
    { id: 3, name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', unlocked: false },
    { id: 4, name: 'Quick Learner', description: 'Complete 5 signs in one session', icon: '⚡', unlocked: false },
    { id: 5, name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '💯', unlocked: false },
    { id: 6, name: 'Sentence Builder', description: 'Create your first sentence', icon: '💬', unlocked: false },
];

const weeklyData = [
    { day: 'Mon', minutes: 0 },
    { day: 'Tue', minutes: 0 },
    { day: 'Wed', minutes: 0 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 0 },
    { day: 'Sat', minutes: 0 },
    { day: 'Sun', minutes: 0 },
];

const Progress = () => {
    const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 30);

    return (
        <PageContainer>
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-4"
                >
                    <div className="p-3 rounded-xl bg-success/10">
                        <TrendingUp className="w-8 h-8 text-success" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Your Progress</h1>
                        <p className="text-dark-400">Track your learning journey and achievements</p>
                    </div>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="glass-card p-6 text-center"
                    >
                        <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                        <div className="text-3xl font-bold text-dark-100 mb-1">{stat.value}</div>
                        <div className="text-sm text-dark-400">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Weekly Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 glass-card p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-dark-100">Weekly Activity</h2>
                    </div>

                    {/* Chart */}
                    <div className="flex items-end justify-between gap-2 h-40 px-4">
                        {weeklyData.map((day, index) => (
                            <div key={day.day} className="flex flex-col items-center flex-1">
                                <div className="w-full flex justify-center mb-2">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: day.minutes > 0 ? (day.minutes / maxMinutes) * 100 : 8 }}
                                        transition={{ delay: 0.3 + index * 0.05 }}
                                        className={`w-full max-w-[40px] rounded-t-lg ${day.minutes > 0
                                                ? 'bg-gradient-to-t from-primary to-secondary'
                                                : 'bg-dark-700'
                                            }`}
                                        style={{ minHeight: '8px' }}
                                    />
                                </div>
                                <span className="text-xs text-dark-400">{day.day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    <div className="mt-6 text-center py-4 border-t border-dark-700">
                        <p className="text-dark-400 text-sm">
                            Start learning to see your activity here! 📊
                        </p>
                    </div>
                </motion.div>

                {/* Level Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="w-5 h-5 text-warning" />
                        <h2 className="text-lg font-semibold text-dark-100">Level Progress</h2>
                    </div>

                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 mb-3">
                            <span className="text-3xl font-bold gradient-text">1</span>
                        </div>
                        <h3 className="text-lg font-semibold text-dark-100">Beginner</h3>
                        <p className="text-sm text-dark-400">Level 1</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-dark-400">Progress to Level 2</span>
                            <span className="text-dark-300">0/100 XP</span>
                        </div>
                        <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                style={{ width: '0%' }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Achievements */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 glass-card p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <Trophy className="w-5 h-5 text-warning" />
                    <h2 className="text-lg font-semibold text-dark-100">Achievements</h2>
                    <span className="ml-auto text-sm text-dark-400">
                        0/{achievements.length} unlocked
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {achievements.map((achievement) => (
                        <motion.div
                            key={achievement.id}
                            whileHover={{ scale: 1.05 }}
                            className={`p-4 rounded-xl text-center transition-all ${achievement.unlocked
                                    ? 'bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30'
                                    : 'bg-dark-700/50 border border-dark-600 opacity-50'
                                }`}
                        >
                            <div className="text-3xl mb-2 grayscale-[${achievement.unlocked ? 0 : 100}]">
                                {achievement.icon}
                            </div>
                            <h3 className="text-sm font-medium text-dark-200 mb-1">{achievement.name}</h3>
                            <p className="text-xs text-dark-400">{achievement.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </PageContainer>
    );
};

export default Progress;
