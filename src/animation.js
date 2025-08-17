/**
 * animation.js - High-performance animation system for Einstein-Rosen bridge
 * Uses modern Three.js animation techniques with optimized rendering
 */
import * as THREE from 'three';
import { appState, sceneObjects } from './setup.js';


// Timing variables
const clock = new THREE.Clock();
let deltaTime = 0;
let elapsedTime = 0;
let frameCount = 0;
let lastTime = 0;

// Performance monitoring
let fpsUpdateInterval = 1000; // ms
let lastFpsUpdate = 0;
let fps = 0;

// DOM elements cache
let journeyProgressBar;
let journeyPhaseText;
let glitchEffect;
let lensFlare;

// Initialize the animation system
export function initAnimation() {
    // Cache DOM elements for better performance
    journeyProgressBar = document.getElementById('journey-progress-bar');
    journeyPhaseText = document.getElementById('journey-phase');
    glitchEffect = document.getElementById('glitch');
    lensFlare = document.getElementById('lens-flare');

    // Start the animation loop using modern setAnimationLoop
    sceneObjects.renderer.setAnimationLoop(animate);

    // Return control functions
    return {
        stop: () => sceneObjects.renderer.setAnimationLoop(null),
        resume: () => sceneObjects.renderer.setAnimationLoop(animate)
    };
}

/**
 * Main animation loop - designed for optimal performance
 * This is where all animations are coordinated
 */
function animate() {
    // Use requestAnimationFrame's timestamp for precise timing
    const currentTime = performance.now();
    deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms to prevent jumps
    lastTime = currentTime;
    elapsedTime = clock.getElapsedTime();

    // FPS counter logic
    frameCount++;
    if (currentTime - lastFpsUpdate > fpsUpdateInterval) {
        fps = Math.round(frameCount / ((currentTime - lastFpsUpdate) / 1000));
        frameCount = 0;
        lastFpsUpdate = currentTime;

        // Optional: Update FPS display if needed
        // document.getElementById('fps-counter').textContent = `${fps} FPS`;
    }

    // Store current time in appState for external use
    appState.time = elapsedTime;

    // Different camera behavior based on mode
    if (appState.journeyMode) {
        updateJourneyAnimation();
    } else {
        updateCameraFromMouse();
    }

    // Update scene elements - each in its own function for better performance
    updateWormhole();
    updateParticleSystems();
    updateCelestialObjects();
    updateAccretionDisk();

    // Advanced techniques for improved visual quality
    updateLensFlareEffect();

    // Final rendering with post-processing
    sceneObjects.composer.render();
}

/**
 * Camera movement based on mouse position
 * Enhanced with variable easing for more natural movement
 */
function updateCameraFromMouse() {
    // Set target position from mouse
    appState.targetX = appState.mouseX * 0.5;
    appState.targetY = appState.mouseY * 0.5;

    // Calculate distance to target for variable easing
    const distX = appState.targetX - sceneObjects.camera.position.x;
    const distY = -appState.targetY - sceneObjects.camera.position.y;

    // Variable easing based on distance (faster for larger movements)
    const easeFactorX = 0.05 + 0.1 * Math.min(1, Math.abs(distX) / 50);
    const easeFactorY = 0.05 + 0.1 * Math.min(1, Math.abs(distY) / 50);

    // Apply smooth movement
    sceneObjects.camera.position.x += distX * easeFactorX;
    sceneObjects.camera.position.y += distY * easeFactorY;

    // Maintain look at center
    sceneObjects.camera.lookAt(sceneObjects.scene.position);
}

/**
 * Enhanced wormhole journey animation
 * Cinematic camera movement with varying effects
 */
function updateJourneyAnimation() {
    if (!appState.journeyStarted) return;

    // Variable speed progression for more natural movement
    const progressSpeed = 0.004 * (1.0 + Math.sin(elapsedTime * 0.5) * 0.1);
    appState.journeyProgress += progressSpeed;

    // Get camera reference
    const camera = sceneObjects.camera;

    // Phase 1: Approach (0.0 - 1.0)
    if (appState.journeyProgress < 1.0) {
        // Smooth approach to wormhole
        camera.position.z = 1500 - appState.journeyProgress * 1000;

        // Graceful camera movement that decreases as we get closer
        const approachFactor = 1 - appState.journeyProgress;
        const wobbleAmount = 30 * Math.pow(approachFactor, 1.5);
        camera.position.x = Math.sin(appState.journeyProgress * Math.PI * 2 + elapsedTime * 0.5) * wobbleAmount;
        camera.position.y = Math.cos(appState.journeyProgress * Math.PI * 2 + elapsedTime * 0.7) * wobbleAmount;

        // Gradually increase glitch effect
        const glitchIntensity = appState.journeyProgress * 0.3;
        glitchEffect.style.opacity = glitchIntensity;
        appState.glitchIntensity = glitchIntensity;

        // Update UI indicators
        updateJourneyUI(appState.journeyProgress * 33, "Approaching Wormhole");
    }
    // Phase 2: Throat Passage (1.0 - 2.0)
    else if (appState.journeyProgress < 2.0) {
        const throatProgress = appState.journeyProgress - 1.0;
        camera.position.z = 500 - throatProgress * 1000;

        // Calculate throat center position (0.5 = exact center)
        const distFromCenter = Math.abs(throatProgress - 0.5);
        const centerIntensity = 1 - distFromCenter * 2; // 1.0 at center, 0.0 at edges

        // More intense effects at the throat center
        const shakeAmount = 50 * centerIntensity;
        const shakeSpeed = 5 + centerIntensity * 10;

        // Apply dynamic camera shake
        camera.position.x = Math.sin(throatProgress * Math.PI * 10 + elapsedTime * shakeSpeed) * shakeAmount;
        camera.position.y = Math.cos(throatProgress * Math.PI * 10 + elapsedTime * shakeSpeed * 1.3) * shakeAmount;

        // Peak glitch effect at throat center
        const glitchIntensity = 0.3 + centerIntensity * 0.7;
        glitchEffect.style.opacity = glitchIntensity;
        appState.glitchIntensity = glitchIntensity;

        // Update UI with appropriate phase text
        const phaseText = throatProgress < 0.5 ? "Entering Wormhole Throat" : "Spacetime Compression";
        updateJourneyUI(33 + throatProgress * 33, phaseText);
    }
    // Phase 3: Exit (2.0 - 3.0)
    else if (appState.journeyProgress < 3.0) {
        const exitProgress = appState.journeyProgress - 2.0;
        camera.position.z = -500 - exitProgress * 1000;

        // Gradually decrease effects as we exit
        const exitFactor = 1 - exitProgress;
        const shakeAmount = 20 * Math.pow(exitFactor, 2);

        // Smoother exit shake
        camera.position.x = Math.sin(exitProgress * Math.PI * 5 + elapsedTime * 3) * shakeAmount;
        camera.position.y = Math.cos(exitProgress * Math.PI * 5 + elapsedTime * 3) * shakeAmount;

        // Fade out glitch effect
        const glitchIntensity = 0.3 * Math.pow(exitFactor, 2);
        glitchEffect.style.opacity = glitchIntensity;
        appState.glitchIntensity = glitchIntensity;

        // Update UI
        updateJourneyUI(66 + exitProgress * 34, "Exiting Wormhole");
    }
    // Journey Complete
    else {
        completeJourney();
    }

    // Always look at the center
    camera.lookAt(0, 0, 0);
}

/**
 * Update journey UI elements
 */
function updateJourneyUI(progress, phaseText) {
    if (journeyProgressBar) {
        journeyProgressBar.style.width = `${progress}%`;
    }

    if (journeyPhaseText) {
        journeyPhaseText.textContent = phaseText;
    }
}

/**
 * Handle journey completion
 */
function completeJourney() {
    // Reset journey state
    appState.journeyMode = false;
    appState.journeyStarted = false;

    // Update UI
    const journeyBtn = document.getElementById('journey-btn');
    if (journeyBtn) journeyBtn.textContent = "Begin Journey";
    if (glitchEffect) glitchEffect.style.opacity = 0;
    appState.glitchIntensity = 0;

    // Hide progress bar
    document.getElementById('journey-progress').style.opacity = 0;

    // Show completion message
    const hintElement = document.getElementById('hint-1');
    if (hintElement) {
        hintElement.textContent = "Journey complete! Click journey button to travel again.";
        hintElement.style.opacity = 1;
        setTimeout(() => {
            hintElement.style.opacity = 0;
        }, 5000);
    }

    // Return to original position with a delay
    setTimeout(() => {
        if (sceneObjects.camera.userData.originalPosition) {
            sceneObjects.camera.position.set(
                sceneObjects.camera.userData.originalPosition.x,
                sceneObjects.camera.userData.originalPosition.y,
                sceneObjects.camera.userData.originalPosition.z
            );
        }
    }, 1000);
}

/**
 * Wormhole animation - carefully optimized
 * Based on the wormhole in search result [6]
 */
function updateWormhole() {
    const wormhole = sceneObjects.wormhole;
    if (!wormhole || !wormhole.mesh) return;

    // Get time for animations
    const time = appState.time;

    // Slow, majestic rotation (reduced from original)
    wormhole.mesh.rotation.z += 0.0004;

    // Apply optimized animations to inner meshes
    if (wormhole.innerMesh1 && wormhole.innerMesh2) {
        // More subtle pulsing for inner meshes
        const pulseFactor1 = 0.015 * Math.sin(time * 1.5);
        const pulseFactor2 = 0.022 * Math.sin(time * 1.2 + 1);

        wormhole.innerMesh1.scale.x = 0.95 + pulseFactor1;
        wormhole.innerMesh1.scale.z = 0.95 + pulseFactor1;

        wormhole.innerMesh2.scale.x = 0.90 + pulseFactor2;
        wormhole.innerMesh2.scale.z = 0.90 + pulseFactor2;

        // Slower rotation for better visual quality
        wormhole.innerMesh1.rotation.y += 0.002;
        wormhole.innerMesh2.rotation.y -= 0.003;
    }

    // Material opacity animations
    if (wormhole.outermostMaterial) {
        wormhole.outermostMaterial.opacity = 0.3 + 0.1 * Math.sin(time * 0.8);
    }

    if (wormhole.outerMaterial) {
        wormhole.outerMaterial.opacity = 0.6 + 0.1 * Math.sin(time * 1.2);
    }

    if (wormhole.innerMaterial) {
        wormhole.innerMaterial.opacity = 0.8 + 0.15 * Math.sin(time * 1.5);
    }

    // Event horizon animation
    if (wormhole.eventHorizon) {
        wormhole.eventHorizon.rotation.z += 0.007;
        wormhole.eventHorizon.material.opacity = 0.4 + 0.2 * Math.sin(time * 2);
    }

    // Color shifts (subtle)
    const hue1 = ((time * 0.03) % 1) * 0.1 + 0.5; // Stay in blue range
    const hue2 = ((time * 0.02) % 1) * 0.1 + 0.6; // Stay in blue-cyan range

    if (wormhole.outermostMaterial) {
        wormhole.outermostMaterial.color.setHSL(hue1, 0.8, 0.6);
    }

    if (wormhole.innerMaterial) {
        wormhole.innerMaterial.color.setHSL(hue2, 0.9, 0.7);
    }

    // Reduced number of active rings (as requested)
    if (wormhole.rings && wormhole.rings.length > 0) {
        // Only show 3 rings at a time for better performance
        const activeRingCount = Math.min(3, wormhole.rings.length);

        // Determine which rings to show based on a cycling pattern
        const ringOffset = Math.floor(time * 0.2) % wormhole.rings.length;

        // Update all rings
        for (let i = 0; i < wormhole.rings.length; i++) {
            const ring = wormhole.rings[i];
            if (!ring) continue;

            // Calculate if this ring should be active in the current cycle
            const isActive = (i + ringOffset) % wormhole.rings.length < activeRingCount;
            ring.visible = isActive;

            // Only animate visible rings (performance optimization)
            if (isActive) {
                // Subtle pulsing animation
                const pulseSpeed = ring.userData.pulseSpeed || 0.5;
                const pulsePhase = ring.userData.pulsePhase || 0;
                const pulse = Math.sin(time * pulseSpeed + pulsePhase);

                // Subtle scale changes
                ring.scale.set(
                    1 + pulse * 0.05,
                    1,
                    1 + pulse * 0.05
                );

                // Smooth opacity changes
                ring.material.opacity = 0.2 + 0.15 * Math.abs(pulse);

                // Gentle movement along wormhole
                if (ring.userData.originalY !== undefined) {
                    ring.position.y = ring.userData.originalY +
                        Math.sin(time * 0.25 + pulsePhase) * 8;
                }
            }
        }
    }

    // Animate entrance barrier (if visible)
    if (wormhole.entranceBarrier && wormhole.entranceBarrier.visible) {
        wormhole.entranceBarrier.rotation.z += 0.01;
        wormhole.entranceBarrier.material.opacity = 0.5 + 0.3 * Math.sin(time * 1.2);
    }

    // Animate exit universe (if visible)
    if (wormhole.exitUniverse && wormhole.exitUniverse.visible) {
        wormhole.exitUniverse.rotation.z -= 0.006;
        const pulseFactor = 0.06 * Math.sin(time * 0.7);
        wormhole.exitUniverse.scale.set(
            1 + pulseFactor,
            1,
            1 + pulseFactor
        );
    }
}

/**
 * Animate the accretion disk
 */
function updateAccretionDisk() {
    const disk = sceneObjects.accretionDisk;
    if (disk && disk.material.uniforms.u_time) {
        disk.material.uniforms.u_time.value = elapsedTime;
    }
}

/**
 * Optimized particle systems animation
 * Using smooth motion patterns with layered oscillation
 */
function updateParticleSystems() {
    const systems = sceneObjects.particleSystems;
    if (!systems || !systems.length) return;

    const time = appState.time;

    systems.forEach(system => {
        if (!system || !system.geometry || !system.geometry.attributes.position) return;

        const positions = system.geometry.attributes.position.array;
        const originalPositions = system.userData.originalPositions;
        const velocities = system.userData.velocities;

        if (!positions || !originalPositions || !velocities) return;

        const count = originalPositions.length / 3;

        // Update all particles with improved motion patterns
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Layer multiple oscillations for more organic movement
            // This creates the appearance of particles flowing toward/around the wormhole
            const flowFactor = 0.2 + 0.8 * Math.sin(time * 0.1 + i * 0.01);
            const baseOscillation = 3 + flowFactor * 2;

            // X position - horizontal movement
            positions[i3] = originalPositions[i3] +
                Math.sin(time * velocities[i3] + i * 0.1) * baseOscillation;

            // Y position - vertical movement with different phase
            positions[i3 + 1] = originalPositions[i3 + 1] +
                Math.cos(time * velocities[i3 + 1] + i * 0.1) * baseOscillation;

            // Z position - depth movement with third phase
            positions[i3 + 2] = originalPositions[i3 + 2] +
                Math.sin(time * velocities[i3 + 2] + i * 0.1 + Math.PI/2) * baseOscillation;
        }

        // Flag for GPU update
        system.geometry.attributes.position.needsUpdate = true;
    });
}

/**
 * Update celestial objects with smooth rotations
 */
function updateCelestialObjects() {
    if (!sceneObjects.scene) return;

    sceneObjects.scene.traverse(object => {
        if (!object.userData) return;

        // Animate planets with custom rotation axes
        if (object.userData.rotationSpeed && object.userData.rotationAxis) {
            // Time-based rotation for consistent speed regardless of framerate
            const rotationAmount = object.userData.rotationSpeed * deltaTime * 60;
            object.rotateOnAxis(object.userData.rotationAxis, rotationAmount);
        }
        // Animate galaxies and other celestial objects
        else if (object.userData.rotationSpeed) {
            object.rotation.z += object.userData.rotationSpeed * deltaTime * 60;
        }
    });
}

/**
 * Enhanced lens flare effect
 */
function updateLensFlareEffect() {
    if (!lensFlare) return;

    // Make lens flare subtly pulse with time
    const baseBrightness = parseFloat(lensFlare.style.opacity) || 0;
    if (baseBrightness > 0) {
        const pulseAmount = 0.1 * Math.sin(elapsedTime * 2);
        const newBrightness = Math.max(0, Math.min(1, baseBrightness + pulseAmount));
        lensFlare.style.opacity = newBrightness;
    }
}
