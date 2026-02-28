/**
 * ModelViewer Component
 * Main 3D viewer container with controls and state management
 * Merged: Teammate's Video Tabs + Your Purple Placeholder Logic
 */

import { useState, useRef, useCallback, useEffect, lazy, Suspense, memo, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
    Maximize2,
    Minimize2,
    RefreshCw,
    ZoomIn,
    ZoomOut,
    Cuboid,
    Video
} from 'lucide-react';
import ModelControls from './ModelControls';
import ModelLoadingState from '../common/ModelLoadingState';
import ModelErrorState from '../common/ModelErrorState';
import Button from '@/components/common/Button';
import VideoPlayer from '@/components/video/VideoPlayer';

// Lazy load the 3D component for performance
const HandModel3D = lazy(() => import('./HandModel3D'));

const ModelViewer = memo(({
    letter = 'A',
    onModelLoad,
    showControls = true,
    className = '',
    height = '100%' // Allow overriding height
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [autoRotate, setAutoRotate] = useState(false);
    const [viewMode, setViewMode] = useState('3d'); // '3d' or 'video'
    const [videoError, setVideoError] = useState(false);
    
    const controlsRef = useRef(null);
    const videoRef = useRef(null);

    // 🤝 Merged: Your placeholder check combined with teammate's new words
    const letterStr = String(letter).toUpperCase();
    
    // Add all your new words and teammate's new words here!
    const REAL_MODELS = ['A', 'E', 'I', 'F', 'L', 'LOVE', 'WANT', 'WATER', 'WHAT', 'TIME', 'THANK-YOU', 'PLEASE', ];
    const hasRealModel = REAL_MODELS.includes(letterStr);

    // 🤝 Merged: Smart pathing. Automatically switches between /words/ and /alphabet/ based on length
    const modelPath = useMemo(() => {
        if (!hasRealModel) return null; // Triggers your purple box
        return letterStr.length > 1 
            ? `/models/words/word_${letterStr.toLowerCase()}.glb` 
            : `/models/alphabet/letter_${letterStr}.glb`;
    }, [letterStr, hasRealModel]);

    const videoPath = useMemo(() => {
        return letterStr.length > 1 
            ? `/videos/words/word_${letterStr.toLowerCase()}.mp4` 
            : `/videos/alphabet/letter_${letterStr}.mp4`;
    }, [letterStr]);

    const handleLoad = useCallback(() => {
        console.log(`✅ Model fully loaded: ${letterStr}`);
        requestAnimationFrame(() => {
            setIsLoading(false);
            setHasError(false);
            if (onModelLoad) onModelLoad(letterStr);
        });
    }, [letterStr, onModelLoad]);

    const handleError = useCallback((error) => {
        console.error(`⚠️ Model error for ${letterStr}:`, error);
        setIsLoading(false);
        setHasError(true);
    }, [letterStr]);

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

    // 🤝 Merged: Your custom loading timeouts perfectly combined with teammate's video reset
    useEffect(() => {
        const initTimer = setTimeout(() => {
            setIsLoading(true);
            setHasError(false);
            setVideoError(false);
        }, 0);

        let fallbackTimer;
        // For placeholder models, close loading animation after 500ms
        if (!hasRealModel) {
            fallbackTimer = setTimeout(() => {
                setIsLoading(false);
            }, 500);
        } else {
            // For real models, keep original 1500ms timeout
            fallbackTimer = setTimeout(() => {
                setIsLoading(false);
            }, 1500);
        }

        if (videoRef.current) {
            videoRef.current.load(); // Reload video when letter changes
        }

        return () => {
            clearTimeout(initTimer);
            if (fallbackTimer) clearTimeout(fallbackTimer);
        };
    }, [letterStr, hasRealModel]);

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
                flex flex-col
                ${className}
            `}
        >
            {/* 🤝 Merged: Teammate's View Mode Tabs */}
            <div className="flex border-b border-dark-700 w-full overflow-hidden shrink-0 bg-dark-800 rounded-t-2xl z-20">
                <button
                    onClick={() => setViewMode('3d')}
                    className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${viewMode === '3d'
                        ? 'bg-dark-700/50 text-white border-b-2 border-primary'
                        : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/30 border-b-2 border-transparent'
                        }`}
                >
                    <Cuboid className="w-4 h-4" />
                    3D Model
                </button>
                <button
                    onClick={() => setViewMode('video')}
                    className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${viewMode === 'video'
                        ? 'bg-dark-700/50 text-white border-b-2 border-primary'
                        : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/30 border-b-2 border-transparent'
                        }`}
                >
                    <Video className="w-4 h-4" />
                    Video Example
                </button>
            </div>

            {/* 🤝 Merged: Teammate's Letter Badge */}
            <AnimatePresence>
                {viewMode === '3d' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute top-16 left-4 z-20 pointer-events-none"
                    >
                        <div className="
                            min-w-[3rem] px-4 h-12 rounded-xl
                            bg-dark-800/80 backdrop-blur-md
                            border border-dark-600/50
                            flex items-center justify-center
                            shadow-lg
                        ">
                            <span className="text-2xl font-bold bg-gradient-to-br from-white to-dark-200 bg-clip-text text-transparent capitalize">
                                {letterStr}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`relative w-full aspect-square sm:aspect-[4/3] flex-1 ${height !== '100%' ? '' : 'md:aspect-[16/10] min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]'}`} style={height !== '100%' ? { height } : {}}>
                <AnimatePresence mode="wait">
                    {viewMode === '3d' ? (
                        <motion.div
                            key="3d-viewer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            {/* 🤝 Merged: Your Robust Loading & Error States */}
                            <AnimatePresence mode="wait">
                                {hasError ? (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-dark-800"
                                    >
                                        <ModelErrorState onRetry={handleRetry} />
                                    </motion.div>
                                ) : isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-20 bg-dark-800 flex items-center justify-center"
                                    >
                                        <ModelLoadingState message={`Loading ${letterStr}...`} />
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            {/* Persistently mounted canvas to prevent WebGL Context Loss */}
                            <motion.div
                                className="w-full h-full absolute inset-0 z-10 transition-opacity duration-300"
                                style={{ opacity: hasError ? 0 : 1, pointerEvents: hasError || isLoading ? 'none' : 'auto' }}
                            >
                                <Suspense fallback={null}>
                                    <HandModel3D
                                        modelPath={modelPath}
                                        letter={letterStr}
                                        autoRotate={autoRotate}
                                        onLoad={handleLoad}
                                        onError={handleError}
                                        controlsRef={controlsRef}
                                    />
                                </Suspense>
                            </motion.div>

                            {/* 🤝 Merged: Controls Toolbar */}
                            <AnimatePresence>
                                {showControls && !isLoading && !hasError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
                                    >
                                        <ModelControls
                                            onResetView={handleResetView}
                                            onToggleAutoRotate={handleToggleAutoRotate}
                                            onZoomIn={handleZoomIn}
                                            onZoomOut={handleZoomOut}
                                            isAutoRotating={autoRotate}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Interaction hint */}
                            <AnimatePresence>
                                {!isLoading && !hasError && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: 1 }}
                                        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 text-xs text-dark-400 pointer-events-none drop-shadow-md"
                                    >
                                        Drag to rotate • Scroll to zoom
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        /* 🤝 Merged: Teammate's Video Player logic */
                        <motion.div
                            key="video-viewer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 w-full h-full bg-dark-900 flex items-center justify-center p-4 sm:p-6"
                        >
                            {videoError ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center mb-4">
                                        <Video className="w-8 h-8 text-dark-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Video Unavailable</h3>
                                    <p className="text-dark-300 text-sm">
                                        We're still working on the video example for {letterStr}.
                                    </p>
                                </div>
                            ) : (
                                <VideoPlayer
                                    videoUrl={videoPath}
                                    autoplay={true}
                                    loop={true}
                                    onError={() => setVideoError(true)}
                                    className="w-full h-full max-h-full object-cover rounded-b-2xl"
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div >
    );
});

ModelViewer.displayName = 'ModelViewer';
export default ModelViewer;