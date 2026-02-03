/**
 * Next Steps Component
 * Recommendation panel for next actions
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, ChevronRight, Target, Repeat, Zap } from 'lucide-react';
import Button from '@/components/common/Button';
import { alphabetSigns, getDifficultyLabel } from '@/data/signsData';

/**
 * Next Steps Component
 * 
 * @param {Object} props
 * @param {Array} props.learnedSigns - Array of learned sign letters
 * @param {Array} props.practiceHistory - Practice history
 */
const NextSteps = ({ learnedSigns = [], practiceHistory = [] }) => {
    const navigate = useNavigate();

    // Calculate recommendations
    const recommendations = useMemo(() => {
        const recs = [];

        // Find next sign to learn
        const nextToLearn = alphabetSigns.find(s => !learnedSigns.includes(s.letter));
        if (nextToLearn) {
            recs.push({
                type: 'learn',
                icon: Target,
                iconColor: 'text-success',
                title: `Learn Letter ${nextToLearn.letter}`,
                description: `${getDifficultyLabel(nextToLearn.difficulty)} difficulty`,
                action: () => navigate(`/learn/${nextToLearn.letter}`),
                buttonText: 'Start Learning'
            });
        }

        // Find sign that needs practice (low accuracy)
        const signAccuracies = {};
        practiceHistory.forEach(session => {
            if (!signAccuracies[session.sign]) {
                signAccuracies[session.sign] = { total: 0, count: 0 };
            }
            signAccuracies[session.sign].total += session.accuracy || 0;
            signAccuracies[session.sign].count += 1;
        });

        const needsPractice = Object.entries(signAccuracies)
            .map(([sign, data]) => ({
                sign,
                avgAccuracy: data.count > 0 ? data.total / data.count : 0
            }))
            .filter(s => s.avgAccuracy < 80 && learnedSigns.includes(s.sign))
            .sort((a, b) => a.avgAccuracy - b.avgAccuracy)[0];

        if (needsPractice) {
            recs.push({
                type: 'practice',
                icon: Repeat,
                iconColor: 'text-warning',
                title: `Practice Letter ${needsPractice.sign}`,
                description: `Current accuracy: ${Math.round(needsPractice.avgAccuracy)}%`,
                action: () => navigate('/practice/free'),
                buttonText: 'Practice Now'
            });
        }

        // Suggest challenges if enough signs learned
        if (learnedSigns.length >= 3) {
            recs.push({
                type: 'challenge',
                icon: Zap,
                iconColor: 'text-accent',
                title: 'Take a Challenge',
                description: 'Test your speed with a timed challenge',
                action: () => navigate('/practice/timed'),
                buttonText: 'Start Challenge'
            });
        }

        return recs.slice(0, 3);
    }, [learnedSigns, practiceHistory, navigate]);

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-dark-100">Recommended Next Steps</h3>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                    <motion.div
                        key={rec.type}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors"
                    >
                        <div className="p-2 rounded-lg bg-dark-700">
                            <rec.icon className={`w-5 h-5 ${rec.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-dark-100">{rec.title}</div>
                            <div className="text-sm text-dark-400">{rec.description}</div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={rec.action}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                            {rec.buttonText}
                        </Button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default NextSteps;
