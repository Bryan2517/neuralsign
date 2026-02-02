/**
 * useCamera Hook
 * Custom React hook for camera management
 * 
 * NeuralSign - AI Sign Language Learning Platform
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Camera configuration options
 */
const DEFAULT_CONSTRAINTS = {
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user' // Front camera
    },
    audio: false
};

/**
 * Custom hook for managing camera access
 * 
 * @returns {Object} Camera state and controls
 */
export function useCamera() {
    // State
    const [stream, setStream] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Refs
    const videoRef = useRef(null);

    /**
     * Start the camera
     */
    const startCamera = useCallback(async () => {
        // Prevent multiple starts
        if (isActive || isLoading) {
            console.log('ℹ️ Camera already active or loading');
            return true;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('📷 Requesting camera access...');

            // Check if mediaDevices is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser');
            }

            // Request camera access
            const mediaStream = await navigator.mediaDevices.getUserMedia(DEFAULT_CONSTRAINTS);

            console.log('✅ Camera access granted');

            // Set video source
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;

                // Wait for video to be ready
                await new Promise((resolve, reject) => {
                    const video = videoRef.current;

                    video.onloadedmetadata = () => {
                        video.play()
                            .then(resolve)
                            .catch(reject);
                    };

                    video.onerror = () => reject(new Error('Video loading failed'));

                    // Timeout after 10 seconds
                    setTimeout(() => reject(new Error('Video loading timeout')), 10000);
                });

                console.log(`📹 Video ready: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
            }

            setStream(mediaStream);
            setIsActive(true);
            setIsLoading(false);

            return true;
        } catch (err) {
            console.error('❌ Camera error:', err);

            let errorMessage = 'Failed to start camera.';

            // Handle specific errors
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMessage = 'No camera found. Please check your device.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMessage = 'Camera is in use by another application. Please close other apps using the camera.';
            } else if (err.name === 'OverconstrainedError') {
                errorMessage = 'Camera does not meet requirements.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setIsLoading(false);
            setIsActive(false);

            return false;
        }
    }, [isActive, isLoading]);

    /**
     * Stop the camera
     */
    const stopCamera = useCallback(() => {
        console.log('🛑 Stopping camera...');

        // Stop all media tracks
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
                console.log(`⏹️ Stopped track: ${track.kind}`);
            });
        }

        // Clear video source
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setStream(null);
        setIsActive(false);
        setError(null);

        console.log('✅ Camera stopped');
    }, [stream]);

    /**
     * Retry camera start after error
     */
    const retry = useCallback(() => {
        setError(null);
        startCamera();
    }, [startCamera]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (stream) {
                console.log('🧹 Cleaning up camera on unmount...');
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return {
        // State
        stream,
        isActive,
        isLoading,
        error,

        // Refs
        videoRef,

        // Actions
        startCamera,
        stopCamera,
        retry
    };
}

export default useCamera;
