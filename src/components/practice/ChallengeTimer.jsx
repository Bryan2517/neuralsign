/**
 * Challenge Timer Component
 * Large countdown timer with color transitions
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Challenge Timer Component
 * 
 * @param {Object} props
 * @param {number} props.timeRemaining - Seconds remaining
 * @param {number} props.totalTime - Total time in seconds
 * @param {boolean} props.isActive - Whether timer is running
 * @param {function} props.onComplete - Callback when timer reaches 0
 */
const ChallengeTimer = ({
    timeRemaining,
    totalTime = 60,
    isActive = true,
    onComplete
}) => {
    const hasCompletedRef = useRef(false);

    // Determine color based on time remaining
    const getTimerColor = () => {
        if (timeRemaining > totalTime * 0.5) {
            return 'text-success'; // > 50%: Green
        } else if (timeRemaining > totalTime * 0.16) {
            return 'text-warning'; // 16-50%: Amber
        }
        return 'text-error'; // < 16%: Red
    };

    // Determine ring color
    const getRingColor = () => {
        if (timeRemaining > totalTime * 0.5) {
            return 'stroke-success';
        } else if (timeRemaining > totalTime * 0.16) {
            return 'stroke-warning';
        }
        return 'stroke-error';
    };

    // Calculate progress for ring
    const progress = totalTime > 0 ? (timeRemaining / totalTime) : 0;
    const circumference = 2 * Math.PI * 54; // radius = 54
    const strokeDashoffset = circumference * (1 - progress);

    // Trigger completion callback
    useEffect(() => {
        if (timeRemaining === 0 && !hasCompletedRef.current && isActive) {
            hasCompletedRef.current = true;
            onComplete?.();
        }
    }, [timeRemaining, isActive, onComplete]);

    // Reset completion flag when timer resets
    useEffect(() => {
        if (timeRemaining > 0) {
            hasCompletedRef.current = false;
        }
    }, [timeRemaining]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* SVG Ring */}
            <svg
                className="transform -rotate-90"
                width="128"
                height="128"
                viewBox="0 0 120 120"
            >
                {/* Background ring */}
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-dark-700"
                />
                {/* Progress ring */}
                <motion.circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className={getRingColor()}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset,
                    }}
                    initial={false}
                    animate={{
                        strokeDashoffset,
                    }}
                    transition={{ duration: 0.3 }}
                />
            </svg>

            {/* Time display */}
            <motion.div
                className={`absolute inset-0 flex items-center justify-center ${getTimerColor()}`}
                animate={
                    timeRemaining <= 10 && timeRemaining > 0
                        ? { scale: [1, 1.05, 1] }
                        : {}
                }
                transition={{
                    duration: 1,
                    repeat: timeRemaining <= 10 && timeRemaining > 0 ? Infinity : 0
                }}
            >
                <span className="text-4xl font-bold tabular-nums">
                    {formatTime(timeRemaining)}
                </span>
            </motion.div>

            {/* Pulse effect when low on time */}
            {timeRemaining <= 10 && timeRemaining > 0 && (
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-error"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity
                    }}
                />
            )}
        </div>
    );
};

export default ChallengeTimer;
