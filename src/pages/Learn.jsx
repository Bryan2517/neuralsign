/**
 * Learn Page
 * Sign language lessons and curriculum
 */

import { motion } from 'framer-motion';
import { GraduationCap, Book, Star, Lock, ChevronRight, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';

const lessons = [
    {
        id: 'alphabet',
        title: 'The Alphabet',
        description: 'Learn all 26 letters of the ASL alphabet',
        icon: '🔤',
        progress: 0,
        duration: '30 min',
        difficulty: 'Beginner',
        isLocked: false,
        signs: 26,
    },
    {
        id: 'numbers',
        title: 'Numbers 1-10',
        description: 'Master counting in sign language',
        icon: '🔢',
        progress: 0,
        duration: '15 min',
        difficulty: 'Beginner',
        isLocked: false,
        signs: 10,
    },
    {
        id: 'greetings',
        title: 'Greetings',
        description: 'Common greetings and introductions',
        icon: '👋',
        progress: 0,
        duration: '20 min',
        difficulty: 'Beginner',
        isLocked: false,
        signs: 12,
    },
    {
        id: 'common-words',
        title: 'Common Words',
        description: 'Essential everyday vocabulary',
        icon: '💬',
        progress: 0,
        duration: '45 min',
        difficulty: 'Intermediate',
        isLocked: true,
        signs: 30,
    },
    {
        id: 'emotions',
        title: 'Emotions',
        description: 'Express feelings and emotions',
        icon: '😊',
        progress: 0,
        duration: '25 min',
        difficulty: 'Intermediate',
        isLocked: true,
        signs: 15,
    },
    {
        id: 'questions',
        title: 'Questions',
        description: 'Ask and answer common questions',
        icon: '❓',
        progress: 0,
        duration: '35 min',
        difficulty: 'Advanced',
        isLocked: true,
        signs: 20,
    },
];

const difficultyColors = {
    Beginner: 'bg-success/10 text-success border-success/20',
    Intermediate: 'bg-warning/10 text-warning border-warning/20',
    Advanced: 'bg-error/10 text-error border-error/20',
};

const Learn = () => {
    return (
        <PageContainer>
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-4"
                >
                    <div className="p-3 rounded-xl bg-primary/10">
                        <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Learn Sign Language</h1>
                        <p className="text-dark-400">Master sign language through interactive 3D lessons</p>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4 p-4 glass-card"
                >
                    <div className="text-center">
                        <div className="text-2xl font-bold gradient-text">6</div>
                        <div className="text-sm text-dark-400">Lessons</div>
                    </div>
                    <div className="text-center border-x border-dark-700">
                        <div className="text-2xl font-bold gradient-text">113</div>
                        <div className="text-sm text-dark-400">Total Signs</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold gradient-text">0%</div>
                        <div className="text-sm text-dark-400">Complete</div>
                    </div>
                </motion.div>
            </div>

            {/* Lessons Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson, index) => (
                    <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className={`glass-card p-6 group hover:border-primary/30 transition-all duration-300 ${lesson.isLocked ? 'opacity-60' : ''
                            }`}
                    >
                        {/* Lesson Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="text-4xl">{lesson.icon}</div>
                            {lesson.isLocked ? (
                                <Lock className="w-5 h-5 text-dark-400" />
                            ) : (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${difficultyColors[lesson.difficulty]}`}>
                                    {lesson.difficulty}
                                </span>
                            )}
                        </div>

                        {/* Lesson Info */}
                        <h3 className="text-xl font-semibold text-dark-100 mb-2">{lesson.title}</h3>
                        <p className="text-dark-400 text-sm mb-4">{lesson.description}</p>

                        {/* Lesson Meta */}
                        <div className="flex items-center gap-4 text-xs text-dark-400 mb-4">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {lesson.duration}
                            </div>
                            <div className="flex items-center gap-1">
                                <Book className="w-3.5 h-3.5" />
                                {lesson.signs} signs
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-dark-400">Progress</span>
                                <span className="text-dark-300">{lesson.progress}%</span>
                            </div>
                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                                    style={{ width: `${lesson.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        {lesson.isLocked ? (
                            <Button variant="ghost" fullWidth isDisabled>
                                <Lock className="w-4 h-4 mr-2" />
                                Complete Previous
                            </Button>
                        ) : (
                            <Link to={`/learn/${lesson.id}`}>
                                <Button variant="primary" fullWidth rightIcon={<ChevronRight className="w-4 h-4" />}>
                                    {lesson.progress > 0 ? 'Continue' : 'Start Lesson'}
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Coming Soon Note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-12 text-dark-400"
            >
                <p>More lessons coming soon! 🚀</p>
            </motion.div>
        </PageContainer>
    );
};

export default Learn;
