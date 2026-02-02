/**
 * ModelControls Component
 * Toolbar with control buttons for the 3D viewer
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
    RotateCcw,
    RefreshCw,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Pause,
    Play
} from 'lucide-react';

/**
 * Control Button Component
 * Individual button with tooltip
 */
const ControlButton = memo(({
    onClick,
    icon: Icon,
    label,
    isActive = false,
    disabled = false
}) => (
    <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className={`
      relative group p-2.5 rounded-lg transition-all duration-200
      ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-dark-100'
            }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
        aria-label={label}
        title={label}
    >
        <Icon className="w-4 h-4" />

        {/* Tooltip */}
        <span className="
      absolute bottom-full left-1/2 -translate-x-1/2 mb-2
      px-2 py-1 text-xs text-white bg-dark-900 rounded
      opacity-0 group-hover:opacity-100 transition-opacity
      whitespace-nowrap pointer-events-none z-10
    ">
            {label}
        </span>
    </motion.button>
));

ControlButton.displayName = 'ControlButton';

/**
 * ModelControls Component
 * 
 * @param {function} onResetView - Reset camera to default position
 * @param {function} onToggleAutoRotate - Toggle auto-rotation
 * @param {function} onZoomIn - Zoom camera in
 * @param {function} onZoomOut - Zoom camera out
 * @param {function} onFullscreen - Toggle fullscreen (optional)
 * @param {boolean} isAutoRotating - Current auto-rotate state
 * @param {string} className - Additional CSS classes
 */
const ModelControls = memo(({
    onResetView,
    onToggleAutoRotate,
    onZoomIn,
    onZoomOut,
    onFullscreen,
    isAutoRotating = false,
    className = '',
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`
        flex items-center gap-2 p-2 
        bg-dark-800/90 backdrop-blur-sm 
        rounded-xl border border-dark-700
        ${className}
      `}
        >
            {/* Reset View */}
            <ControlButton
                onClick={onResetView}
                icon={RotateCcw}
                label="Reset View"
            />

            {/* Divider */}
            <div className="w-px h-6 bg-dark-600" />

            {/* Auto Rotate Toggle */}
            <ControlButton
                onClick={onToggleAutoRotate}
                icon={isAutoRotating ? Pause : RefreshCw}
                label={isAutoRotating ? 'Stop Rotation' : 'Auto Rotate'}
                isActive={isAutoRotating}
            />

            {/* Divider */}
            <div className="w-px h-6 bg-dark-600" />

            {/* Zoom Controls */}
            <ControlButton
                onClick={onZoomIn}
                icon={ZoomIn}
                label="Zoom In"
            />
            <ControlButton
                onClick={onZoomOut}
                icon={ZoomOut}
                label="Zoom Out"
            />

            {/* Fullscreen (optional) */}
            {onFullscreen && (
                <>
                    <div className="w-px h-6 bg-dark-600" />
                    <ControlButton
                        onClick={onFullscreen}
                        icon={Maximize2}
                        label="Fullscreen"
                    />
                </>
            )}
        </motion.div>
    );
});

ModelControls.displayName = 'ModelControls';

export default ModelControls;
