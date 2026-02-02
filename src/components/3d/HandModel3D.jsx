/**
 * HandModel3D Component
 * Core 3D model viewer using @react-three/fiber and @react-three/drei
 * Loads GLTF models and provides interactive viewing experience
 */

import React, { Suspense, useRef, useState, useEffect, useCallback, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// PLACEHOLDER MODEL
// ============================================

/**
 * PlaceholderModel Component
 * Displays when real 3D model is not available
 */
const PlaceholderModel = memo(({ letter, color = '#6366F1' }) => {
    const meshRef = useRef();

    // Gentle rotation animation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        }
    });

    // Create a simple box with the letter as texture
    return (
        <group ref={meshRef}>
            {/* Main cube representing the hand placeholder */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.4}
                    metalness={0.3}
                />
            </mesh>

            {/* Letter display on front face */}
            <mesh position={[0, 0, 0.76]}>
                <planeGeometry args={[1.2, 1.2]} />
                <meshBasicMaterial color="#1E293B" />
            </mesh>

            {/* Decorative ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.2, 0.05, 16, 100]} />
                <meshStandardMaterial
                    color="#8B5CF6"
                    emissive="#8B5CF6"
                    emissiveIntensity={0.2}
                />
            </mesh>
        </group>
    );
});

PlaceholderModel.displayName = 'PlaceholderModel';

// ============================================
// GLTF MODEL LOADER
// ============================================

/**
 * GLTFModel Component
 * Loads and displays GLTF model from path
 * Uses useGLTF which automatically suspends during loading
 */
const GLTFModel = memo(({ modelPath, scale = 1, onLoad }) => {
    // useGLTF suspends while loading (handled by Suspense in parent)
    // Enable draco decoder from CDN for compressed models
    const { scene } = useGLTF(modelPath, true);
    const modelRef = useRef();
    const hasCalledOnLoad = useRef(false);

    // Apply materials and shadows, and normalize scale on load
    useEffect(() => {
        if (scene && !hasCalledOnLoad.current) {
            hasCalledOnLoad.current = true;

            // Calculate bounding box to normalize model size
            const box = new THREE.Box3().setFromObject(scene);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            // Normalize to fit in a 2x2x2 box
            const normalizeScale = maxDim > 0 ? 2 / maxDim : 1;
            scene.scale.setScalar(normalizeScale * scale);

            // Center the model
            const center = box.getCenter(new THREE.Vector3());
            scene.position.sub(center.multiplyScalar(normalizeScale * scale));

            // Apply materials and shadows to all meshes
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        child.material.roughness = 0.5;
                        child.material.metalness = 0.2;
                    }
                }
            });

            console.log('✅ Model loaded and normalized:', modelPath, 'scale:', normalizeScale);
            onLoad?.();
        }
    }, [scene, scale, modelPath, onLoad]);

    if (!scene) {
        return null;
    }

    return (
        <group ref={modelRef}>
            <primitive object={scene} />
        </group>
    );
});

GLTFModel.displayName = 'GLTFModel';

// ============================================
// ERROR BOUNDARY FOR 3D MODELS
// ============================================

/**
 * Simple Error Boundary for catching model loading errors
 */
class ModelErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.log('Model loading error caught:', error);
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || null;
        }
        return this.props.children;
    }
}

// ============================================
// MODEL CONTENT (Inner Canvas Component)
// ============================================

/**
 * ModelContent Component
 * Handles the actual 3D scene content
 */
const ModelContent = memo(({
    modelPath,
    letter,
    scale = 1,
    autoRotate = false,
    onLoad,
    onError,
    controlsRef
}) => {
    const [modelFailed, setModelFailed] = useState(false);
    const pendingErrorRef = useRef(null);
    const { camera } = useThree();

    // Reset camera position
    useEffect(() => {
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
    }, [camera, letter]);

    // Handle model error with deferred state update to avoid setState during render
    const handleModelError = useCallback((error) => {
        // Store the error to be processed in useEffect
        pendingErrorRef.current = error;
    }, []);

    // Process pending error in useEffect to avoid setState during render
    useEffect(() => {
        if (pendingErrorRef.current && !modelFailed) {
            console.log('Model failed to load, using placeholder:', pendingErrorRef.current);
            setModelFailed(true);
            onError?.(pendingErrorRef.current);
            pendingErrorRef.current = null;
        }
    });

    // Letter-based color palette
    const letterColors = {
        A: '#6366F1', B: '#8B5CF6', C: '#EC4899', D: '#10B981',
        E: '#F59E0B', F: '#EF4444', G: '#6366F1', H: '#8B5CF6',
        I: '#EC4899', J: '#10B981', K: '#F59E0B', L: '#EF4444',
        M: '#6366F1', N: '#8B5CF6', O: '#EC4899', P: '#10B981',
        Q: '#F59E0B', R: '#EF4444', S: '#6366F1', T: '#8B5CF6',
        U: '#EC4899', V: '#10B981', W: '#F59E0B', X: '#EF4444',
        Y: '#6366F1', Z: '#8B5CF6',
    };

    return (
        <>
            {/* Lighting Setup */}
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[5, 5, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            <directionalLight
                position={[-5, 3, -5]}
                intensity={0.5}
            />
            <directionalLight
                position={[0, -5, 0]}
                intensity={0.3}
            />

            {/* Environment for reflections */}
            <Environment preset="city" />

            {/* Model or Placeholder */}
            {modelPath && !modelFailed ? (
                <ModelErrorBoundary
                    onError={handleModelError}
                    fallback={<PlaceholderModel letter={letter} color={letterColors[letter] || '#6366F1'} />}
                >
                    <Suspense fallback={<PlaceholderModel letter={letter} color={letterColors[letter] || '#6366F1'} />}>
                        <GLTFModel
                            modelPath={modelPath}
                            scale={scale}
                            onLoad={onLoad}
                        />
                    </Suspense>
                </ModelErrorBoundary>
            ) : (
                <PlaceholderModel letter={letter} color={letterColors[letter] || '#6366F1'} />
            )}

            {/* OrbitControls */}
            <OrbitControls
                ref={controlsRef}
                enableRotate={true}
                enableZoom={true}
                enablePan={false}
                minDistance={2}
                maxDistance={10}
                enableDamping={true}
                dampingFactor={0.05}
                autoRotate={autoRotate}
                autoRotateSpeed={2}
            />
        </>
    );
});

ModelContent.displayName = 'ModelContent';

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * HandModel3D Component
 * Complete 3D model viewer with Canvas setup
 * 
 * @param {string} modelPath - Path to GLTF model file
 * @param {string} letter - Letter being displayed (for placeholder)
 * @param {number} scale - Model scale (default: 1)
 * @param {boolean} autoRotate - Enable auto-rotation
 * @param {function} onLoad - Callback when model loads
 * @param {function} onError - Callback on error
 * @param {object} controlsRef - Ref for OrbitControls
 */
const HandModel3D = memo(({
    modelPath,
    letter = 'A',
    scale = 1,
    autoRotate = false,
    onLoad,
    onError,
    controlsRef,
    className = '',
}) => {
    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas
                camera={{
                    position: [0, 0, 5],
                    fov: 50,
                    near: 0.1,
                    far: 1000,
                }}
                shadows
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#1E293B']} />
                <ModelContent
                    modelPath={modelPath}
                    letter={letter}
                    scale={scale}
                    autoRotate={autoRotate}
                    onLoad={onLoad}
                    onError={onError}
                    controlsRef={controlsRef}
                />
            </Canvas>
        </div>
    );
});

HandModel3D.displayName = 'HandModel3D';

export default HandModel3D;
