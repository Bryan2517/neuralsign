/**
 * Learning Progress Chart Component
 * Area chart showing cumulative signs learned over time
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * Custom Tooltip Component
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="glass-card p-3 border border-dark-600 shadow-xl">
            <div className="text-xs text-dark-400 mb-1">{label}</div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary" />
                <span className="text-sm font-medium text-dark-100">
                    {payload[0].value} signs learned
                </span>
            </div>
        </div>
    );
};

/**
 * Learning Progress Chart Component
 * 
 * @param {Object} props
 * @param {Array} props.practiceHistory - Practice history data
 * @param {Array} props.learnedSigns - Array of learned sign letters
 * @param {number} props.height - Chart height
 */
const LearningProgressChart = ({ practiceHistory = [], learnedSigns = [], height = 250 }) => {
    // Generate chart data - cumulative signs over 30 days
    const chartData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create date range for last 30 days
        const dateRange = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dateRange.push(date);
        }

        // Group practice sessions by date and track first-time signs
        const signsByDate = {};
        const seenSigns = new Set();

        // Sort history by date (oldest first)
        const sortedHistory = [...practiceHistory].sort((a, b) => {
            const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
            const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
            return dateA - dateB;
        });

        // Track when each sign was first practiced
        sortedHistory.forEach(session => {
            const sessionDate = session.timestamp?.toDate?.() || new Date(session.timestamp);
            sessionDate.setHours(0, 0, 0, 0);
            const dateKey = sessionDate.toISOString().split('T')[0];

            if (!signsByDate[dateKey]) {
                signsByDate[dateKey] = new Set();
            }

            // Only count first time a sign appears
            if (session.sign && !seenSigns.has(session.sign)) {
                seenSigns.add(session.sign);
                signsByDate[dateKey].add(session.sign);
            }
        });

        // Build cumulative data
        let cumulative = 0;
        return dateRange.map(date => {
            const dateKey = date.toISOString().split('T')[0];
            const newSigns = signsByDate[dateKey]?.size || 0;
            cumulative += newSigns;

            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                signs: Math.min(cumulative, learnedSigns.length || cumulative),
                newSigns
            };
        });
    }, [practiceHistory, learnedSigns]);

    // Calculate growth
    const growth = useMemo(() => {
        const recent = chartData.slice(-7);
        const older = chartData.slice(-14, -7);

        const recentSum = recent.reduce((sum, d) => sum + d.newSigns, 0);
        const olderSum = older.reduce((sum, d) => sum + d.newSigns, 0);

        if (olderSum === 0) return recentSum > 0 ? 100 : 0;
        return Math.round(((recentSum - olderSum) / olderSum) * 100);
    }, [chartData]);

    const hasData = learnedSigns.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    <h3 className="font-semibold text-dark-100">Learning Progress</h3>
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${growth > 0
                        ? 'bg-success/10 text-success'
                        : growth < 0
                            ? 'bg-error/10 text-error'
                            : 'bg-dark-700 text-dark-400'
                    }`}>
                    {growth > 0 ? '+' : ''}{growth}% this week
                </div>
            </div>

            {/* Chart */}
            <div style={{ height }}>
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                            <defs>
                                <linearGradient id="learningGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                stroke="#374151"
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                stroke="#6B7280"
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: '#374151' }}
                                interval={6}
                            />
                            <YAxis
                                stroke="#6B7280"
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: '#374151' }}
                                domain={[0, 'dataMax + 2']}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="signs"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                fill="url(#learningGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-dark-400">
                        <div className="text-center">
                            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No learning data yet</p>
                            <p className="text-sm">Start learning signs to track your progress!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
                <div className="text-sm text-dark-400">
                    Total Signs Learned: <span className="font-bold text-dark-100">{learnedSigns.length}/26</span>
                </div>
                <div className="text-sm text-dark-400">
                    Last 30 days
                </div>
            </div>
        </motion.div>
    );
};

export default LearningProgressChart;
