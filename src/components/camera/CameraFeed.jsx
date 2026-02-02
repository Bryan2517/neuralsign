/**
 * CameraFeed Component
 * Displays camera video with canvas overlay for hand landmarks
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw, Hand, Loader2, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

/**
 * CameraFeed Component
 * 
 * @param {Object} props
 * @param {React.RefObject} props.videoRef - Ref for video element
 * @param {React.RefObject} props.canvasRef - Ref for canvas overlay
 * @param {boolean} props.isActive - Whether camera is active
 * @param {boolean} props.isLoading - Whether camera is loading
 * @param {boolean} props.isDetecting - Whether detection is running
 * @param {boolean} props.handDetected - Whether a hand is detected
 * @param {string} props.error - Error message if any
 * @param {Function} props.onStart - Start camera callback
 * @param {Function} props.onStop - Stop camera callback
 * @param {Function} props.onRetry - Retry callback
 */
const CameraFeed = memo(({
    videoRef,
    canvasRef,
    isActive = false,
    isLoading = false,
    isDetecting = false,
    handDetected = false,
    error = null,
    onStart,
    onStop,
    onRetry
}) => {
    const containerRef = useRef(null);

    /**
     * Update canvas size to match video
     */
    useEffect(() => {
        const updateCanvasSize = () => {
            if (videoRef?.current && canvasRef?.current && containerRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const container = containerRef.current;

                // Match canvas to container size
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
            }
        };

        // Initial size
        updateCanvasSize();

        // Update on resize
        window.addEventListener('resize', updateCanvasSize);

        // Update when video loads
        if (videoRef?.current) {
            videoRef.current.addEventListener('loadedmetadata', updateCanvasSize);
        }

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, [videoRef, canvasRef, isActive]);

    return (
        <div className="relative w-full">
            {/* Camera container with 16:9 aspect ratio */}
            <div
                ref={containerRef}
                className="relative aspect-video bg-dark-800 rounded-2xl overflow-hidden border-2 border-dark-700"
            >
                {/* Video element (mirrored) */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`
                        absolute inset-0 w-full h-full object-cover
                        transform scale-x-[-1]
                        ${isActive ? 'opacity-100' : 'opacity-0'}
                    `}
                />

                {/* Canvas overlay for landmarks (mirrored to match video) */}
                <canvas
                    ref={canvasRef}
                    className={`
                        absolute inset-0 w-full h-full
                        transform scale-x-[-1]
                        pointer-events-none
                        ${isActive ? 'opacity-100' : 'opacity-0'}
                    `}
                />

                {/* Status badges */}
                <AnimatePresence>
                    {isActive && (
                        <>
                            {/* Live indicator - top left */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-dark-900/80 backdrop-blur-sm rounded-full"
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                                </span>
                                <span className="text-sm font-medium text-success">Live</span>
                            </motion.div>

                            {/* Hand detection indicator - top right */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`
                                    absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5
                                    backdrop-blur-sm rounded-full transition-colors duration-300
                                    ${handDetected
                                        ? 'bg-success/20 border border-success/30'
                                        : 'bg-dark-900/80'
                                    }
                                `}
                            >
                                <Hand className={`w-4 h-4 ${handDetected ? 'text-success' : 'text-dark-400'}`} />
                                <span className={`text-sm font-medium ${handDetected ? 'text-success' : 'text-dark-400'}`}>
                                    {handDetected ? 'Hand Detected' : 'No Hand'}
                                </span>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Inactive/Loading state overlay */}
                <AnimatePresence>
                    {!isActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-dark-800"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                    <p className="text-dark-300">Starting camera...</p>
                                </>
                            ) : error ? (
                                <>
                                    <AlertCircle className="w-12 h-12 text-error mb-4" />
                                    <p className="text-dark-300 text-center px-4 mb-4 max-w-sm">
                                        {error}
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={onRetry}
                                        leftIcon={<RefreshCw className="w-4 h-4" />}
                                    >
                                        Try Again
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 rounded-full bg-dark-700 mb-4">
                                        <Camera className="w-12 h-12 text-dark-400" />
                                    </div>
                                    <p className="text-dark-300 mb-4">Camera is off</p>
                                    <Button
                                        variant="primary"
                                        onClick={onStart}
                                        leftIcon={<Camera className="w-4 h-4" />}
                                    >
                                        Start Camera
                                    </Button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Detection status - bottom center (when detecting but no hand) */}
                <AnimatePresence>
                    {isActive && isDetecting && !handDetected && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                        >
                            <div className="px-4 py-2 bg-dark-900/80 backdrop-blur-sm rounded-full">
                                <p className="text-sm text-dark-300 flex items-center gap-2">
                                    <Hand className="w-4 h-4 animate-pulse" />
                                    Show your hand to start
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls below camera */}
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mt-4"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onStop}
                        leftIcon={<CameraOff className="w-4 h-4" />}
                        className="text-dark-400 hover:text-error"
                    >
                        Stop Camera
                    </Button>
                </motion.div>
            )}
        </div>
    );
});

CameraFeed.displayName = 'CameraFeed';

export default CameraFeed;
