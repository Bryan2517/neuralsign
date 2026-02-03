/**
 * Accuracy Chart Component
 * Line chart showing accuracy trend over sessions
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Target } from 'lucide-react';

/**
 * Custom Tooltip Component
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="glass-card p-3 border border-dark-600 shadow-xl">
            <div className="text-xs text-dark-400 mb-1">{label}</div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-medium text-dark-100">
                    {payload[0].value}% Accuracy
                </span>
            </div>
        </div>
    );
};

/**
 * Accuracy Chart Component
 * 
 * @param {Object} props
 * @param {Array} props.data - Practice history data
 * @param {number} props.height - Chart height
 */
const AccuracyChart = ({ data = [], height = 250 }) => {
    // Process data for chart
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            // Generate sample data for empty state
            return Array.from({ length: 20 }, (_, i) => ({
                session: `Session ${i + 1}`,
                accuracy: 0,
                isEmpty: true
            }));
        }

        // Get last 20 sessions
        const recentSessions = [...data]
            .sort((a, b) => {
                const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
                const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
                return dateB - dateA;
            })
            .slice(0, 20)
            .reverse();

        return recentSessions.map((session, idx) => ({
            session: `#${idx + 1}`,
            accuracy: session.accuracy || 0,
            sign: session.sign
        }));
    }, [data]);

    // Calculate average
    const avgAccuracy = useMemo(() => {
        const validData = chartData.filter(d => !d.isEmpty && d.accuracy > 0);
        if (validData.length === 0) return 0;
        return Math.round(validData.reduce((sum, d) => sum + d.accuracy, 0) / validData.length);
    }, [chartData]);

    const hasData = chartData.some(d => !d.isEmpty);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-dark-100">Accuracy Trend</h3>
                </div>
                <div className="text-sm text-dark-400">
                    Avg: <span className="font-medium text-dark-100">{avgAccuracy}%</span>
                </div>
            </div>

            {/* Chart */}
            <div style={{ height }}>
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                            <CartesianGrid
                                stroke="#374151"
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="session"
                                stroke="#6B7280"
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: '#374151' }}
                            />
                            <YAxis
                                stroke="#6B7280"
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: '#374151' }}
                                domain={[0, 100]}
                                ticks={[0, 25, 50, 75, 100]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine
                                y={avgAccuracy}
                                stroke="#6366F1"
                                strokeDasharray="5 5"
                                strokeOpacity={0.5}
                            />
                            <Line
                                type="monotone"
                                dataKey="accuracy"
                                stroke="#6366F1"
                                strokeWidth={2}
                                dot={{ fill: '#6366F1', strokeWidth: 0, r: 3 }}
                                activeDot={{ r: 5, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-dark-400">
                        <div className="text-center">
                            <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No practice data yet</p>
                            <p className="text-sm">Start practicing to see your accuracy trend!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-dark-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-primary rounded" />
                    <span>Accuracy</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-primary/50 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #6366F1, #6366F1 3px, transparent 3px, transparent 6px)' }} />
                    <span>Average</span>
                </div>
            </div>
        </motion.div>
    );
};

export default AccuracyChart;
