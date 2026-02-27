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

    // 🚀 核心修改 1：判断是否有真实模型 (只有 A 和 E)
    const firstChar = letter ? String(letter).charAt(0).toUpperCase() : 'A';
    const hasRealModel = ['A', 'E'].includes(firstChar);

    // 🚀 核心修改 2：如果没有真实模型，强制传入 null。
    // 这将完美触发队友写好的 `PlaceholderModel` (紫色正方块)！
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

    // 🚀 核心修改 3：完美修复 React 严格模式报错，并自动处理紫色方块的 Loading
    useEffect(() => {
        const initTimer = setTimeout(() => {
            setIsLoading(true);
            setHasError(false);
        }, 0);

        let fallbackTimer;
        // 如果渲染的是紫色正方块，0.5秒后自动关闭 Loading 动画
        if (!hasRealModel) {
            fallbackTimer = setTimeout(() => {
                setIsLoading(false);
            }, 500);
        } else {
            // 如果是真实模型，保留原始兜底加载时间
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
            {/* 🚀 核心修改 4：自适应单词长度的 Badge，不再局限于 w-12 */}
            <div className="absolute top-4 left-4 z-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    className="
                        min-w-[3rem] px-4 h-12 rounded-xl
                        bg-gradient-to-br from-primary to-secondary
                        flex items-center justify-center
                        text-lg font-bold text-white capitalize
                        shadow-lg shadow-primary/30
                    "
                >
                    {letter}
                </motion.div>
            </div>

            <div className="absolute top-4 right-4 z-10">
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="px-3 py-1.5 rounded-full bg-dark-700/80 backdrop-blur-sm text-xs text-dark-300 border border-dark-600"
                >
                    3D Preview
                </motion.div>
            </div>

            {/* 🚀 核心修改 5：移除了写死的高度 (min-h-[500px])，改成 flex-1 自适应 */}
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