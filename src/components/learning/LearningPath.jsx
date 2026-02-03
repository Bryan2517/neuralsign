/**
 * Learning Path Component
 * Visual roadmap with milestones
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, Check, Lock, ChevronRight, Star } from 'lucide-react';
import Button from '@/components/common/Button';

// Milestone definitions
const MILESTONES = [
    {
        id: 'beginner',
        title: 'Beginner',
        description: 'Learn your first 5 signs',
        requirement: 5,
        icon: '🌱',
        rewards: ['First Steps Badge', '+50 XP']
    },
    {
        id: 'intermediate',
        title: 'Intermediate',
        description: 'Master 13 signs (half the alphabet)',
        requirement: 13,
        icon: '📚',
        rewards: ['Scholar Badge', '+100 XP']
    },
    {
        id: 'advanced',
        title: 'Advanced',
        description: 'Learn 20 signs with 70%+ accuracy',
        requirement: 20,
        icon: '🎓',
        rewards: ['Expert Badge', '+150 XP']
    },
    {
        id: 'expert',
        title: 'Expert',
        description: 'Master all 26 letters',
        requirement: 26,
        icon: '👑',
        rewards: ['Alphabet Master Badge', '+250 XP']
    }
];

/**
 * Milestone Card Component
 */
const MilestoneCard = ({ milestone, status, progress, isNext, delay }) => {
    const isCompleted = status === 'completed';
    const isLocked = status === 'locked';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className={`
                relative flex items-start gap-4 p-4 rounded-xl transition-all
                ${isCompleted ? 'bg-success/10 border border-success/30' : ''}
                ${isNext ? 'bg-primary/10 border border-primary/30' : ''}
                ${isLocked ? 'bg-dark-800/50 opacity-60' : ''}
                ${!isCompleted && !isNext && !isLocked ? 'bg-dark-800' : ''}
            `}
        >
            {/* Status indicator */}
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${isCompleted ? 'bg-success text-white' : ''}
                ${isNext ? 'bg-primary text-white' : ''}
                ${isLocked ? 'bg-dark-700 text-dark-500' : ''}
                ${!isCompleted && !isNext && !isLocked ? 'bg-dark-700 text-dark-300' : ''}
            `}>
                {isCompleted ? (
                    <Check className="w-5 h-5" />
                ) : isLocked ? (
                    <Lock className="w-4 h-4" />
                ) : (
                    <span className="text-lg">{milestone.icon}</span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${isLocked ? 'text-dark-500' : 'text-dark-100'}`}>
                        {milestone.title}
                    </h4>
                    {isCompleted && (
                        <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                            Completed
                        </span>
                    )}
                    {isNext && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                            Current
                        </span>
                    )}
                </div>
                <p className={`text-sm mb-2 ${isLocked ? 'text-dark-600' : 'text-dark-400'}`}>
                    {milestone.description}
                </p>

                {/* Progress bar (for current milestone) */}
                {isNext && (
                    <div className="mb-2">
                        <div className="flex justify-between text-xs text-dark-400 mb-1">
                            <span>{progress}/{milestone.requirement} signs</span>
                            <span>{Math.round((progress / milestone.requirement) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(progress / milestone.requirement) * 100}%` }}
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* Rewards */}
                <div className="flex flex-wrap gap-2">
                    {milestone.rewards.map((reward, idx) => (
                        <span
                            key={idx}
                            className={`
                                text-xs px-2 py-0.5 rounded-full
                                ${isCompleted
                                    ? 'bg-success/10 text-success'
                                    : 'bg-dark-700 text-dark-400'
                                }
                            `}
                        >
                            {reward}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Learning Path Component
 * 
 * @param {Object} props
 * @param {Array} props.learnedSigns - Array of learned sign letters
 */
const LearningPath = ({ learnedSigns = [] }) => {
    const navigate = useNavigate();
    const signCount = learnedSigns.length;

    // Calculate milestone statuses
    const milestoneStatuses = useMemo(() => {
        let foundCurrent = false;

        return MILESTONES.map(milestone => {
            if (signCount >= milestone.requirement) {
                return { ...milestone, status: 'completed' };
            } else if (!foundCurrent) {
                foundCurrent = true;
                return { ...milestone, status: 'current' };
            }
            return { ...milestone, status: 'locked' };
        });
    }, [signCount]);

    // Get current milestone
    const currentMilestone = milestoneStatuses.find(m => m.status === 'current');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-secondary" />
                    <h3 className="font-semibold text-dark-100">Learning Path</h3>
                </div>
                <div className="flex items-center gap-1 text-sm text-dark-400">
                    <Star className="w-4 h-4 text-warning" />
                    <span>{signCount}/26</span>
                </div>
            </div>

            {/* Milestones */}
            <div className="space-y-3 mb-4">
                {milestoneStatuses.map((milestone, idx) => (
                    <MilestoneCard
                        key={milestone.id}
                        milestone={milestone}
                        status={milestone.status}
                        progress={signCount}
                        isNext={milestone.status === 'current'}
                        delay={0.3 + idx * 0.1}
                    />
                ))}
            </div>

            {/* CTA */}
            {currentMilestone && (
                <Button
                    variant="primary"
                    fullWidth
                    onClick={() => navigate('/learn')}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                    Continue to {currentMilestone.title}
                </Button>
            )}
        </motion.div>
    );
};

export default LearningPath;
