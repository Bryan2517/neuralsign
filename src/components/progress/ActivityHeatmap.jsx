/**
 * Activity Heatmap Component
 * GitHub-style calendar heatmap showing practice activity
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Flame } from 'lucide-react';

/**
 * Activity Heatmap Component
 * 
 * @param {Object} props
 * @param {Array} props.practiceHistory - Practice history data
 * @param {number} props.days - Number of days to display (default 90)
 */
const ActivityHeatmap = ({ practiceHistory = [], days = 90 }) => {
    // Generate heatmap data
    const { heatmapData, streak, totalSessions, maxSessions } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count sessions per day
        const sessionsByDay = {};
        let maxCount = 0;

        practiceHistory.forEach(session => {
            const sessionDate = session.timestamp?.toDate?.() || new Date(session.timestamp);
            sessionDate.setHours(0, 0, 0, 0);
            const dateKey = sessionDate.toISOString().split('T')[0];

            sessionsByDay[dateKey] = (sessionsByDay[dateKey] || 0) + 1;
            maxCount = Math.max(maxCount, sessionsByDay[dateKey]);
        });

        // Generate cells for last N days
        const cells = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dateKey = date.toISOString().split('T')[0];

            cells.push({
                date,
                dateKey,
                count: sessionsByDay[dateKey] || 0,
                dayOfWeek: date.getDay(),
                weekOfYear: Math.floor(i / 7)
            });
        }

        // Calculate current streak
        let currentStreak = 0;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[cells.length - 1 - i];
            if (cell.count > 0) {
                currentStreak++;
            } else if (i > 0) { // Allow for today not having any yet
                break;
            }
        }

        return {
            heatmapData: cells,
            streak: currentStreak,
            totalSessions: Object.values(sessionsByDay).reduce((sum, count) => sum + count, 0),
            maxSessions: maxCount || 1
        };
    }, [practiceHistory, days]);

    // Get intensity level (0-4)
    const getIntensity = (count) => {
        if (count === 0) return 0;
        const ratio = count / maxSessions;
        if (ratio <= 0.25) return 1;
        if (ratio <= 0.5) return 2;
        if (ratio <= 0.75) return 3;
        return 4;
    };

    // Get color class based on intensity
    const getColorClass = (intensity) => {
        switch (intensity) {
            case 0: return 'bg-dark-700';
            case 1: return 'bg-primary/20';
            case 2: return 'bg-primary/40';
            case 3: return 'bg-primary/60';
            case 4: return 'bg-primary';
            default: return 'bg-dark-700';
        }
    };

    // Group by weeks
    const weeks = useMemo(() => {
        const grouped = [];
        let currentWeek = [];

        // Pad beginning to align with week start (Sunday)
        const firstDay = heatmapData[0];
        if (firstDay) {
            for (let i = 0; i < firstDay.dayOfWeek; i++) {
                currentWeek.push(null);
            }
        }

        heatmapData.forEach(cell => {
            currentWeek.push(cell);
            if (currentWeek.length === 7) {
                grouped.push(currentWeek);
                currentWeek = [];
            }
        });

        // Pad end
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            grouped.push(currentWeek);
        }

        return grouped;
    }, [heatmapData]);

    // Month labels
    const monthLabels = useMemo(() => {
        const labels = [];
        let lastMonth = -1;

        weeks.forEach((week, weekIdx) => {
            const validCell = week.find(c => c !== null);
            if (validCell) {
                const month = validCell.date.getMonth();
                if (month !== lastMonth) {
                    labels.push({
                        month: validCell.date.toLocaleDateString('en-US', { month: 'short' }),
                        weekIdx
                    });
                    lastMonth = month;
                }
            }
        });

        return labels;
    }, [weeks]);

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-dark-100">Activity</h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-warning" />
                        <span className="text-dark-400">{streak} day streak</span>
                    </div>
                    <div className="text-dark-400">
                        {totalSessions} sessions
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto pb-2">
                {/* Month labels */}
                <div className="flex mb-1 ml-8">
                    {monthLabels.map((label, idx) => (
                        <div
                            key={idx}
                            className="text-xs text-dark-400"
                            style={{
                                position: 'relative',
                                left: `${label.weekIdx * 12}px`,
                                marginRight: idx < monthLabels.length - 1 ? '-12px' : 0
                            }}
                        >
                            {label.month}
                        </div>
                    ))}
                </div>

                <div className="flex">
                    {/* Day labels */}
                    <div className="flex flex-col gap-0.5 mr-2 pt-0.5">
                        {dayLabels.map((day, idx) => (
                            <div
                                key={idx}
                                className="text-[10px] text-dark-400 h-[10px] flex items-center"
                                style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex gap-0.5">
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-0.5">
                                {week.map((cell, dayIdx) => (
                                    <motion.div
                                        key={dayIdx}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            delay: 0.3 + (weekIdx * 7 + dayIdx) * 0.002,
                                            type: 'spring',
                                            stiffness: 200
                                        }}
                                        className="relative group"
                                    >
                                        <div
                                            className={`
                                                w-[10px] h-[10px] rounded-sm
                                                ${cell ? getColorClass(getIntensity(cell.count)) : 'bg-transparent'}
                                            `}
                                        />
                                        {/* Tooltip */}
                                        {cell && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-dark-800 border border-dark-600 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                <div className="text-dark-100 font-medium">
                                                    {cell.count} session{cell.count !== 1 ? 's' : ''}
                                                </div>
                                                <div className="text-dark-400">
                                                    {cell.date.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-dark-400">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map(level => (
                    <div
                        key={level}
                        className={`w-[10px] h-[10px] rounded-sm ${getColorClass(level)}`}
                    />
                ))}
                <span>More</span>
            </div>
        </motion.div>
    );
};

export default ActivityHeatmap;
