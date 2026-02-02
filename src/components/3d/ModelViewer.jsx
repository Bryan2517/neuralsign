/**
 * ModelViewer Component
 * Main 3D viewer container with controls and state management
 */

import { useState, useRef, useCallback, useEffect, lazy, Suspense, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModelControls from './ModelControls';
import ModelLoadingState from '../common/ModelLoadingState';
import ModelErrorState from '../common/ModelErrorState';

// Lazy load the 3D component for performance
const HandModel3D = lazy(() => import('./HandModel3D'));

/**
 * ModelViewer Component
 * 
 * @param {string} letter - Letter to display (A-Z)
 * @param {function} onModelLoad - Callback when model loads
 * @param {boolean} showControls - Show control toolbar (default: true)
 * @param {string} className - Additional CSS classes
 */
const ModelViewer = memo(({
    letter = 'A',
    onModelLoad,
    showControls = true,
    className = '',
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [autoRotate, setAutoRotate] = useState(false);
    const controlsRef = useRef(null);

    // Model path based on letter
    const modelPath = `/models/alphabet/letter_${letter}.glb`;

    // Handle model load success
    const handleLoad = useCallback(() => {
        console.log(`✅ Model loaded: ${letter}`);
        setIsLoading(false);
        setHasError(false);
        onModelLoad?.(letter);
    }, [letter, onModelLoad]);

    // Handle model load error
    const handleError = useCallback((error) => {
        console.log(`⚠️ Model error for ${letter}:`, error);
        setIsLoading(false);
        setHasError(true);
    }, [letter]);

    // Handle retry
    const handleRetry = useCallback(() => {
        setIsLoading(true);
        setHasError(false);
    }, []);

    // Reset view to default camera position
    const handleResetView = useCallback(() => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    }, []);

    // Toggle auto-rotation
    const handleToggleAutoRotate = useCallback(() => {
        setAutoRotate(prev => !prev);
    }, []);

    // Zoom controls - OrbitControls uses camera position, not dollyTo
    const handleZoomIn = useCallback(() => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const direction = camera.position.clone().normalize();
            const newDistance = Math.max(camera.position.length() - 1, 2);
            camera.position.copy(direction.multiplyScalar(newDistance));
            controlsRef.current.update();
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const direction = camera.position.clone().normalize();
            const newDistance = Math.min(camera.position.length() + 1, 10);
            camera.position.copy(direction.multiplyScalar(newDistance));
            controlsRef.current.update();
        }
    }, []);

    // Simulate model load completion (since we're using placeholder)
    // In production, this would be called by the actual model loader
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`
        relative overflow-hidden
        bg-dark-800 rounded-2xl
        border border-dark-700
        shadow-xl shadow-black/20
        ${className}
      `}
        >
            {/* Letter Badge */}
            <div className="absolute top-4 left-4 z-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    className="
            w-12 h-12 rounded-xl
            bg-gradient-to-br from-primary to-secondary
            flex items-center justify-center
            text-2xl font-bold text-white
            shadow-lg shadow-primary/30
          "
                >
                    {letter}
                </motion.div>
            </div>

            {/* Placeholder indicator */}
            <div className="absolute top-4 right-4 z-10">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="
            px-3 py-1.5 rounded-full
            bg-dark-700/80 backdrop-blur-sm
            text-xs text-dark-300
            border border-dark-600
          "
                >
                    3D Preview
                </motion.div>
            </div>

            {/* Model Container */}
            <div className="
        w-full aspect-square
        sm:aspect-[4/3]
        md:aspect-[16/10]
        min-h-[300px]
        sm:min-h-[400px]
        lg:min-h-[500px]
      ">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full"
                        >
                            <ModelLoadingState message={`Loading ${letter}...`} />
                        </motion.div>
                    ) : hasError ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full"
                        >
                            <ModelErrorState onRetry={handleRetry} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="model"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full"
                        >
                            <Suspense fallback={<ModelLoadingState message="Initializing 3D..." />}>
                                <HandModel3D
                                    modelPath={modelPath}
                                    letter={letter}
                                    autoRotate={autoRotate}
                                    onLoad={handleLoad}
                                    onError={handleError}
                                    controlsRef={controlsRef}
                                />
                            </Suspense>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls Toolbar */}
            {showControls && !isLoading && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <ModelControls
                        onResetView={handleResetView}
                        onToggleAutoRotate={handleToggleAutoRotate}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        isAutoRotating={autoRotate}
                    />
                </div>
            )}

            {/* Interaction hint */}
            {!isLoading && !hasError && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="
            absolute bottom-16 left-1/2 -translate-x-1/2 z-10
            text-xs text-dark-400 pointer-events-none
          "
                >
                    Drag to rotate • Scroll to zoom
                </motion.div>
            )}
        </motion.div>
    );
});

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer;
