/**
 * Practice Page
 * Practice sign language with different modes
 */

import { motion } from 'framer-motion';
import { Hand, Camera, Zap, Clock, Brain, Shuffle, ChevronRight, Play } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/common/Button';

const practiceModesData = [
    {
        id: 'flashcard',
        title: 'Flashcard Mode',
        description: 'Review signs with interactive 3D flashcards. Perfect for memorization and quick review.',
        icon: Shuffle,
        color: 'from-primary to-primary-400',
        available: true,
    },
    {
        id: 'camera',
        title: 'Camera Practice',
        description: 'Practice signs with real-time AI validation using your camera and MediaPipe.',
        icon: Camera,
        color: 'from-secondary to-secondary-400',
        available: true,
    },
    {
        id: 'quiz',
        title: 'Quiz Mode',
        description: 'Test your knowledge with interactive quizzes. Track your accuracy and improve.',
        icon: Brain,
        color: 'from-accent to-accent-400',
        available: true,
    },
    {
        id: 'timed',
        title: 'Speed Challenge',
        description: 'Race against the clock! How many signs can you complete in 60 seconds?',
        icon: Clock,
        color: 'from-warning to-warning-300',
        available: false,
    },
];

const quickPracticeOptions = [
    { label: 'Alphabet', signs: 26, icon: '🔤' },
    { label: 'Numbers', signs: 10, icon: '🔢' },
    { label: 'Greetings', signs: 12, icon: '👋' },
    { label: 'Random Mix', signs: 20, icon: '🎲' },
];

const Practice = () => {
    return (
        <PageContainer>
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-4"
                >
                    <div className="p-3 rounded-xl bg-secondary/10">
                        <Hand className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-100">Practice</h1>
                        <p className="text-dark-400">Strengthen your skills with different practice modes</p>
                    </div>
                </motion.div>
            </div>

            {/* Quick Practice Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
            >
                <h2 className="text-xl font-semibold text-dark-100 mb-4">Quick Practice</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickPracticeOptions.map((option) => (
                        <button
                            key={option.label}
                            className="glass-card p-4 text-left hover:border-primary/30 transition-all duration-300 group"
                        >
                            <div className="text-3xl mb-2">{option.icon}</div>
                            <h3 className="font-medium text-dark-100 group-hover:text-primary transition-colors">
                                {option.label}
                            </h3>
                            <p className="text-sm text-dark-400">{option.signs} signs</p>
                        </button>
                    ))}
                </div>
            </motion.section>

            {/* Practice Modes */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-semibold text-dark-100 mb-4">Practice Modes</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {practiceModesData.map((mode, index) => (
                        <motion.div
                            key={mode.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            className={`glass-card p-6 hover:border-primary/30 transition-all duration-300 ${!mode.available ? 'opacity-60' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${mode.color}`}>
                                    <mode.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-dark-100">{mode.title}</h3>
                                        {!mode.available && (
                                            <span className="px-2 py-0.5 text-xs bg-dark-700 text-dark-400 rounded-full">
                                                Coming Soon
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-dark-400 text-sm mb-4">{mode.description}</p>
                                    <Button
                                        variant={mode.available ? 'primary' : 'ghost'}
                                        size="sm"
                                        isDisabled={!mode.available}
                                        rightIcon={mode.available ? <Play className="w-4 h-4" /> : null}
                                    >
                                        {mode.available ? 'Start Practice' : 'Coming Soon'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* AI Features Note */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12 glass-card p-6 flex items-start gap-4"
            >
                <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-dark-100 mb-1">Powered by AI</h3>
                    <p className="text-sm text-dark-400">
                        Our practice modes use Gemini AI and MediaPipe for real-time hand tracking and
                        intelligent feedback. Get personalized tips to improve your signing technique!
                    </p>
                </div>
            </motion.div>
        </PageContainer>
    );
};

export default Practice;
