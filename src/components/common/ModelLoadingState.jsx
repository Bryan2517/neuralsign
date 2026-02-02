/**
 * ModelLoadingState Component
 * Beautiful loading state for 3D models
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Animated 3D Cube Loader
 */
const CubeLoader = () => (
    <div className="relative w-16 h-16" style={{ perspective: '200px' }}>
        <motion.div
            animate={{
                rotateX: [0, 360],
                rotateY: [0, 360],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
            }}
            className="w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* Front face */}
            <div
                className="absolute w-16 h-16 bg-gradient-to-br from-primary to-secondary opacity-80 rounded-lg"
                style={{ transform: 'translateZ(32px)' }}
            />
            {/* Back face */}
            <div
                className="absolute w-16 h-16 bg-gradient-to-br from-secondary to-accent opacity-80 rounded-lg"
                style={{ transform: 'rotateY(180deg) translateZ(32px)' }}
            />
            {/* Left face */}
            <div
                className="absolute w-16 h-16 bg-gradient-to-br from-primary to-accent opacity-80 rounded-lg"
                style={{ transform: 'rotateY(-90deg) translateZ(32px)' }}
            />
            {/* Right face */}
            <div
                className="absolute w-16 h-16 bg-gradient-to-br from-accent to-secondary opacity-80 rounded-lg"
                style={{ transform: 'rotateY(90deg) translateZ(32px)' }}
            />
        </motion.div>
    </div>
);

/**
 * ModelLoadingState Component
 * 
 * @param {string} message - Loading message to display
 * @param {string} className - Additional CSS classes
 */
const ModelLoadingState = memo(({
    message = 'Loading 3D model...',
    className = ''
}) => {
    return (
        <div
            className={`
        flex flex-col items-center justify-center
        w-full h-full min-h-[300px]
        bg-dark-800 rounded-xl
        ${className}
      `}
        >
            {/* Animated Cube */}
            <CubeLoader />

            {/* Loading Text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-dark-300 text-sm font-medium"
            >
                {message}
            </motion.p>

            {/* Pulsing dots */}
            <div className="flex items-center gap-1.5 mt-3">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                        className="w-2 h-2 rounded-full bg-primary"
                    />
                ))}
            </div>
        </div>
    );
});

ModelLoadingState.displayName = 'ModelLoadingState';

export default ModelLoadingState;
