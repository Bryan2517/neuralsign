/**
 * Stats Card Component
 * Reusable stat display card with icon and trend
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Stats Card Component
 * 
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.iconColor - Icon color class
 * @param {string} props.bgColor - Background gradient class
 * @param {string} props.label - Stat label
 * @param {string|number} props.value - Main value
 * @param {string} props.subValue - Secondary value (optional)
 * @param {number} props.trend - Trend percentage (-100 to 100)
 * @param {number} props.delay - Animation delay
 */
const StatsCard = ({
    icon: Icon,
    iconColor = 'text-primary',
    bgColor = 'from-primary/20 to-primary/5',
    label,
    value,
    subValue,
    trend,
    delay = 0
}) => {
    // Determine trend display
    const getTrendDisplay = () => {
        if (trend === undefined || trend === null) return null;

        if (trend > 0) {
            return {
                icon: TrendingUp,
                color: 'text-success',
                text: `+${trend}%`
            };
        } else if (trend < 0) {
            return {
                icon: TrendingDown,
                color: 'text-error',
                text: `${trend}%`
            };
        }
        return {
            icon: Minus,
            color: 'text-dark-400',
            text: '0%'
        };
    };

    const trendDisplay = getTrendDisplay();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card p-4 hover:shadow-lg transition-shadow"
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${bgColor}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="text-sm text-dark-400 mb-1">{label}</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-dark-100">{value}</span>
                        {subValue && (
                            <span className="text-sm text-dark-400">{subValue}</span>
                        )}
                    </div>
                </div>

                {/* Trend indicator */}
                {trendDisplay && (
                    <div className={`flex items-center gap-1 ${trendDisplay.color}`}>
                        <trendDisplay.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{trendDisplay.text}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatsCard;
