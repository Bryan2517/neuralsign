/**
 * AccuracyMeter Component
 * Circular SVG accuracy indicator with animation
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Get color based on accuracy value
 */
const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return '#10B981'; // Green
    if (accuracy >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
};

/**
 * Get color class based on accuracy value
 */
const getAccuracyColorClass = (accuracy) => {
    if (accuracy >= 80) return 'text-success';
    if (accuracy >= 50) return 'text-warning';
    return 'text-error';
};

/**
 * AccuracyMeter Component
 * 
 * @param {Object} props
 * @param {number} props.accuracy - Accuracy percentage (0-100)
 * @param {boolean} props.isAnimated - Whether to animate the fill
 * @param {boolean} props.showLabel - Whether to show "Accuracy" label
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 */
const AccuracyMeter = memo(({
    accuracy = 0,
    isAnimated = true,
    showLabel = true,
    size = 'md'
}) => {
    const [displayValue, setDisplayValue] = useState(isAnimated ? 0 : accuracy);

    // Animate the number counting up
    useEffect(() => {
        if (!isAnimated) {
            setDisplayValue(accuracy);
            return;
        }

        let start = 0;
        const end = accuracy;
        const duration = 1000; // 1 second
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeOut);

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [accuracy, isAnimated]);

    // Size configurations
    const sizes = {
        sm: { size: 80, stroke: 6, fontSize: 'text-xl' },
        md: { size: 120, stroke: 8, fontSize: 'text-3xl' },
        lg: { size: 160, stroke: 10, fontSize: 'text-4xl' }
    };

    const config = sizes[size] || sizes.md;
    const { size: svgSize, stroke, fontSize } = config;

    const center = svgSize / 2;
    const radius = (svgSize - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (accuracy / 100) * circumference;
    const color = getAccuracyColor(accuracy);
    const colorClass = getAccuracyColorClass(accuracy);

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: svgSize, height: svgSize }}>
                {/* Background circle */}
                <svg
                    width={svgSize}
                    height={svgSize}
                    className="transform -rotate-90"
                >
                    {/* Track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={stroke}
                    />

                    {/* Progress */}
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: isAnimated ? strokeDashoffset : strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{
                            filter: `drop-shadow(0 0 6px ${color}40)`
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={isAnimated ? { scale: 0.5, opacity: 0 } : {}}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        className={`font-bold ${fontSize} ${colorClass}`}
                    >
                        {displayValue}%
                    </motion.span>
                </div>
            </div>

            {/* Label */}
            {showLabel && (
                <motion.span
                    initial={isAnimated ? { opacity: 0, y: 5 } : {}}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-dark-400 text-sm mt-2"
                >
                    Accuracy
                </motion.span>
            )}
        </div>
    );
});

AccuracyMeter.displayName = 'AccuracyMeter';

/**
 * LinearAccuracyBar Component
 * Alternative linear bar version
 */
export const LinearAccuracyBar = memo(({
    accuracy = 0,
    isAnimated = true,
    showLabel = true,
    height = 'md'
}) => {
    const color = getAccuracyColor(accuracy);
    const colorClass = getAccuracyColorClass(accuracy);

    const heights = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-dark-400">Accuracy</span>
                    <span className={`text-sm font-semibold ${colorClass}`}>
                        {accuracy}%
                    </span>
                </div>
            )}
            <div className={`w-full ${heights[height]} bg-dark-700 rounded-full overflow-hidden`}>
                <motion.div
                    initial={isAnimated ? { width: 0 } : { width: `${accuracy}%` }}
                    animate={{ width: `${accuracy}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`${heights[height]} rounded-full`}
                    style={{
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}40`
                    }}
                />
            </div>
        </div>
    );
});

LinearAccuracyBar.displayName = 'LinearAccuracyBar';

export default AccuracyMeter;
