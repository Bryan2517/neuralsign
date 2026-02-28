/**
 * ModelViewer Component
 * Main 3D viewer container with controls and state management
 */

import { useState, useRef, useCallback, useEffect, lazy, Suspense, memo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import ModelControls from './ModelControls';
import ModelLoadingState from '../common/ModelLoadingState';
import ModelErrorState from '../common/ModelErrorState';

// Lazy load the 3D component for performance
const HandModel3D = lazy(() => import('./HandModel3D'));

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

    // Determine if a real model exists for this letter (only A and E have real models)
    const firstChar = letter ? String(letter).charAt(0).toUpperCase() : 'A';
    const hasRealModel = ['A', 'E'].includes(firstChar);

    // If no real model exists, pass null to trigger the PlaceholderModel (purple cube)
    const modelPath = hasRealModel ? `/models/alphabet/letter_${firstChar}.glb` : null;

    const handleLoad = useCallback(() => {
        console.log(`✅ Model loaded: ${letter}`);
        setIsLoading(false);
        setHasError(false);
        onModelLoad?.(letter);
    }, [letter, onModelLoad]);

    const handleError = useCallback((error) => {
        console.log(`⚠️ Model error for ${letter}:`, error);
        setIsLoading(false);
        setHasError(true);
    }, [letter]);

    const handleRetry = useCallback(() => {
        setIsLoading(true);
        setHasError(false);
    }, []);

    const handleResetView = useCallback(() => {
        if (controlsRef.current) controlsRef.current.reset();
    }, []);

    const handleToggleAutoRotate = useCallback(() => {
        setAutoRotate(prev => !prev);
    }, []);

    const handleZoomIn = useCallback(() => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const direction = camera.position.clone().normalize();
            camera.position.copy(direction.multiplyScalar(Math.max(camera.position.length() - 1, 2)));
            controlsRef.current.update();
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (controlsRef.current) {
            const camera = controlsRef.current.object;
            const direction = camera.position.clone().normalize();
            camera.position.copy(direction.multiplyScalar(Math.min(camera.position.length() + 1, 10)));
            controlsRef.current.update();
        }
    }, []);

    // Fix React strict mode warning and auto-handle loading state for placeholder models
    useEffect(() => {
        const initTimer = setTimeout(() => {
            setIsLoading(true);
            setHasError(false);
        }, 0);

        let fallbackTimer;
        // For placeholder models, close loading animation after 500ms
        if (!hasRealModel) {
            fallbackTimer = setTimeout(() => {
                setIsLoading(false);
            }, 500);
        } else {
            // For real models, keep original timeout
            fallbackTimer = setTimeout(() => {
                setIsLoading(false);
            }, 1500);
        }

        return () => {
            clearTimeout(initTimer);
            if (fallbackTimer) clearTimeout(fallbackTimer);
        };
    }, [letter, hasRealModel]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`
                relative overflow-hidden
                bg-dark-800 rounded-2xl
                border border-dark-700
                shadow-xl shadow-black/20 flex flex-col
                ${className}
            `}
        >
            {/* Badge showing 3D preview indicator */}
            
            <div className="absolute top-4 right-4 z-10">
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="px-3 py-1.5 rounded-full bg-dark-700/80 backdrop-blur-sm text-xs text-dark-300 border border-dark-600"
                >
                    3D Preview
                </motion.div>
            </div>

            {/* Responsive container with flex layout instead of fixed height */}
            <div className="w-full flex-1 relative min-h-[250px]">
                <div className="absolute inset-0 w-full h-full">
                    <AnimatePresence mode="wait">
                        {hasError ? (
                            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-dark-800">
                                <ModelErrorState onRetry={handleRetry} />
                            </motion.div>
                        ) : isLoading ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-dark-800">
                                <ModelLoadingState message={`Loading ${letter}...`} />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {!hasError && (
                        <motion.div key="model" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                            <Suspense fallback={<div className="flex justify-center items-center w-full h-full text-primary">Loading 3D Model...</div>}>
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
                </div>
            </div>

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

            {!isLoading && !hasError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 text-xs text-dark-400 pointer-events-none drop-shadow-md">
                    Drag to rotate • Scroll to zoom
                </motion.div>
            )}
        </motion.div>
    );
});

ModelViewer.displayName = 'ModelViewer';
export default ModelViewer;
