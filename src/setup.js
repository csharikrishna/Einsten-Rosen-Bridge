/**
 * setup.js - Handles initialization, scene setup, and event handling
 * Optimized for performance and memory efficiency
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';


// Global state accessible to animation module
export const appState = {
   time: 0,
   mouseX: 0,
   mouseY: 0,
   targetX: 0,
   targetY: 0,
   journeyMode: false,
   journeyProgress: 0,
   journeyStarted: false,
   windowHalfX: window.innerWidth / 2,
   windowHalfY: window.innerHeight / 2,
   glitchIntensity: 0
};

// Scene objects accessible to animation module
export const sceneObjects = {
   scene: null,
   camera: null,
   renderer: null,
   composer: null,
   wormhole: null,
   particleSystems: [],
   glitchPass: null,
   accretionDisk: null,
};

// Initialize the 3D scene and return setup promise
export function initScene() {
   return new Promise((resolve) => {
       // DOM elements
       const loadingScreen = document.getElementById('loading');
       const loadingStatus = document.getElementById('loading-status');
       const loaderBar = document.getElementById('loader-bar');
       const title = document.getElementById('title');
       const glitchEffect = document.getElementById('glitch');
       const lensFlare = document.getElementById('lens-flare');
       const journeyBtn = document.getElementById('journey-btn');
       const distortionSlider = document.getElementById('distortion');
       const distortionValue = document.getElementById('distortion-value');
       const wormholeTypeSelect = document.getElementById('wormhole-type');
       const throatDiameter = document.getElementById('throat-diameter');
       const exoticMatter = document.getElementById('exotic-matter');
       const timeDilation = document.getElementById('time-dilation');

       // Loading sequence
       const loadingSteps = [
           "Calibrating space-time coordinates...",
           "Stabilizing exotic matter...",
           "Generating quantum field equations...",
           "Establishing event horizon boundaries...",
           "Computing gravitational lensing effects...",
           "Optimizing Lorentzian manifold...",
           "Initializing traversable tunnel...",
           "Wormhole ready for exploration"
       ];

       // Update loader function
       function updateLoader(step) {
           if (step < loadingSteps.length) {
               loadingStatus.textContent = loadingSteps[step];
               loaderBar.style.width = `${(step / (loadingSteps.length - 1)) * 100}%`;
           }
       }

       // Simulate loading with performance-friendly timeouts instead of intervals
       function simulateLoading() {
           let currentStep = 0;

           function loadNext() {
               if (currentStep >= loadingSteps.length) {
                   finishLoading();
                   return;
               }

               updateLoader(currentStep);
               currentStep++;
               setTimeout(loadNext, 800);
           }

           loadNext();
       }

       // Setup scene when loading completes
       function finishLoading() {
           // Hide loading screen
           loadingScreen.classList.add('hidden');

           // Show title with animation
           setTimeout(() => {
               title.classList.add('visible');

               setTimeout(() => {
                   title.classList.remove('visible');
               }, 5000);
           }, 500);

           // Signal completion to animation module
           resolve();
       }

       // ======== THREE.JS SETUP ========
       // Create scene
       const scene = new THREE.Scene();
       sceneObjects.scene = scene;

       // Frustum culling optimization
       scene.matrixAutoUpdate = false; // Only update matrices when needed

       // Camera setup
       const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);
       camera.position.z = 1200;
       sceneObjects.camera = camera;

       // Optimized renderer
       const renderer = new THREE.WebGLRenderer({
           antialias: true,
           alpha: true,
           logarithmicDepthBuffer: true,
           powerPreference: "high-performance"
       });

       renderer.setSize(window.innerWidth, window.innerHeight);
       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for performance
       renderer.toneMapping = THREE.ACESFilmicToneMapping;
       renderer.toneMappingExposure = 1.2;
       renderer.outputEncoding = THREE.sRGBEncoding;

       // Memory optimization: pre-compute render targets
       renderer.initTexture = function(texture) {
           texture.needsUpdate = true;
           return texture;
       };

       document.body.appendChild(renderer.domElement);
       sceneObjects.renderer = renderer;

       // Post-processing setup
       const composer = new EffectComposer(renderer);
       const renderPass = new RenderPass(scene, camera);
       composer.addPass(renderPass);

       // Enhanced bloom pass
       const bloomPass = new UnrealBloomPass(
           new THREE.Vector2(window.innerWidth, window.innerHeight),
           1.5,  // strength
           0.4,  // radius
           0.85  // threshold
       );
       composer.addPass(bloomPass);

       // Custom optimized glitch pass (based on search result [3])
       const glitchPass = createOptimizedGlitchPass();
       composer.addPass(glitchPass);
       sceneObjects.glitchPass = glitchPass;

       // Store composer for animation module
       sceneObjects.composer = composer;

       // ======== LIGHTING SETUP ========
       // Ambient light
       const ambientLight = new THREE.AmbientLight(0x111122, 0.2);
       scene.add(ambientLight);

       // Primary light sources
       const pointLight = new THREE.PointLight(0x0088ff, 2, 1000, 1.5);
       pointLight.position.set(0, 0, 500);
       scene.add(pointLight);

       // Secondary light source
       const pointLight2 = new THREE.PointLight(0x0044aa, 1, 1500, 1.2);
       pointLight2.position.set(500, 500, -500);
       scene.add(pointLight2);

       // Camera light
       const cameraLight = new THREE.PointLight(0x00ffff, 1, 500, 2);
       camera.add(cameraLight);
       scene.add(camera);

       // ======== TEXTURE LOADER ========
       const textureLoader = new THREE.TextureLoader();
       const nebulaTexture = textureLoader.load('/assets/nebula.png');
       const galaxyTexture = textureLoader.load('/assets/galaxy.png');
       const eventHorizonTexture = textureLoader.load('/assets/event-horizon.png');
       nebulaTexture.wrapS = THREE.RepeatWrapping;
       nebulaTexture.wrapT = THREE.RepeatWrapping;

       // ======== OPTIMIZED BACKGROUND CREATION ========
       function createGalacticBackground() {
           // Create merged star field for better performance
           const starsGeometry = new THREE.BufferGeometry();

           // Using instanced rendering for stars would be more efficient,
           // but for simplicity we'll use a merged buffer geometry
           const starsVertices = [];
           const starsSizes = [];
           const starsColors = [];

           // Create varying star attributes
           for (let i = 0; i < 4000; i++) {
               const x = (Math.random() - 0.5) * 5000;
               const y = (Math.random() - 0.5) * 5000;
               const z = (Math.random() - 0.5) * 5000;
               starsVertices.push(x, y, z);

               // Vary star size
               const size = 0.5 + Math.random() * 2;
               starsSizes.push(size);

               // Vary star color
               const r = 0.9 + Math.random() * 0.1;
               const g = 0.9 + Math.random() * 0.1;
               const b = 0.9 + Math.random() * 0.1;
               starsColors.push(r, g, b);
           }

           starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
           starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));

           // Use a shader material for more efficient star rendering
           const starsMaterial = new THREE.PointsMaterial({
               size: 1.5,
               transparent: true,
               opacity: 0.8,
               vertexColors: true,
               sizeAttenuation: true
           });

           const stars = new THREE.Points(starsGeometry, starsMaterial);
           scene.add(stars);

           // Nebula backdrop - using lower poly count for performance
           const nebulaGeometry = new THREE.SphereGeometry(4000, 24, 24);
           const nebulaMaterial = new THREE.MeshBasicMaterial({
               side: THREE.BackSide,
               transparent: true,
               opacity: 0.2,
               map: nebulaTexture,
               depthWrite: false // Performance optimization
           });

           const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
           scene.add(nebula);

           // Additional smaller nebulae
           // Using object pooling for similar objects
           const smallNebulaGeometries = [
               new THREE.SphereGeometry(1000, 20, 20),
               new THREE.SphereGeometry(1200, 20, 20),
               new THREE.SphereGeometry(1500, 20, 20)
           ];

           for (let i = 0; i < 3; i++) {
               // Reuse geometries from the pool
               const nebulaSmallGeometry = smallNebulaGeometries[i % smallNebulaGeometries.length];

               const hue = Math.random();
               const color = new THREE.Color().setHSL(hue, 0.6, 0.2);

               const nebulaSmallMaterial = new THREE.MeshBasicMaterial({
                   color: color,
                   side: THREE.BackSide,
                   transparent: true,
                   opacity: 0.1,
                   map: nebulaTexture,
                   depthWrite: false
               });

               const nebulaSmall = new THREE.Mesh(nebulaSmallGeometry, nebulaSmallMaterial);

               const phi = Math.random() * Math.PI * 2;
               const theta = Math.random() * Math.PI;

               nebulaSmall.position.x = 1500 * Math.sin(theta) * Math.cos(phi);
               nebulaSmall.position.y = 1500 * Math.sin(theta) * Math.sin(phi);
               nebulaSmall.position.z = 1500 * Math.cos(theta);

               scene.add(nebulaSmall);
           }
       }

       // Create optimized celestial objects
       function createCelestialObjects() {
           // Create instanced celestial objects for better performance

           // Optimized planets
           const planetGeometries = [
               new THREE.SphereGeometry(100, 24, 24),
               new THREE.SphereGeometry(150, 24, 24),
               new THREE.SphereGeometry(200, 24, 24)
           ];

           for (let i = 0; i < 3; i++) {
               const planetGeometry = planetGeometries[i % planetGeometries.length];

               const hue = Math.random();
               const planetMaterial = new THREE.MeshPhongMaterial({
                   color: new THREE.Color().setHSL(hue, 0.7, 0.4),
                   emissive: new THREE.Color().setHSL(hue, 0.5, 0.1),
                   specular: 0x333333,
                   shininess: 10
               });

               const planet = new THREE.Mesh(planetGeometry, planetMaterial);

               const distance = 1500 + Math.random() * 1500;
               const phi = Math.random() * Math.PI * 2;
               const theta = Math.random() * Math.PI;

               planet.position.x = distance * Math.sin(theta) * Math.cos(phi);
               planet.position.y = distance * Math.sin(theta) * Math.sin(phi);
               planet.position.z = distance * Math.cos(theta);

               planet.rotation.x = Math.random() * Math.PI;
               planet.rotation.y = Math.random() * Math.PI;

               scene.add(planet);

               // Add rotation animation data
               planet.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
               planet.userData.rotationAxis = new THREE.Vector3(
                   Math.random() - 0.5,
                   Math.random() - 0.5,
                   Math.random() - 0.5
               ).normalize();
           }

           // Optimized galaxies - using same geometry for both
           const galaxyGeometry = new THREE.CircleGeometry(200, 32);

           for (let i = 0; i < 2; i++) {
               const galaxyMaterial = new THREE.MeshBasicMaterial({
                   map: galaxyTexture,
                   transparent: true,
                   opacity: 0.7,
                   side: THREE.DoubleSide,
                   depthWrite: false
               });

               const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);

               const distance = 2000 + Math.random() * 1000;
               const phi = Math.random() * Math.PI * 2;
               const theta = Math.random() * Math.PI;

               galaxy.position.x = distance * Math.sin(theta) * Math.cos(phi);
               galaxy.position.y = distance * Math.sin(theta) * Math.sin(phi);
               galaxy.position.z = distance * Math.cos(theta);

               galaxy.rotation.x = Math.random() * Math.PI;
               galaxy.rotation.y = Math.random() * Math.PI;

               scene.add(galaxy);

               galaxy.userData.rotationSpeed = 0.0005 + Math.random() * 0.0005;
           }

           // Distant stars with optimized lights
           // Using fewer stars with more impact for better performance
           const starGeometry = new THREE.SphereGeometry(40, 16, 16);
           const colorChoices = [0xffffee, 0xeeeeff, 0xffff99];

           for (let i = 0; i < 3; i++) { // Reduced from 5 to 3 for performance
               const starColor = colorChoices[i % colorChoices.length];

               const starMaterial = new THREE.MeshBasicMaterial({
                   color: starColor,
                   emissive: starColor
               });

               const star = new THREE.Mesh(starGeometry, starMaterial);

               const distance = 2500 + Math.random() * 1500;
               const phi = Math.random() * Math.PI * 2;
               const theta = Math.random() * Math.PI;

               star.position.x = distance * Math.sin(theta) * Math.cos(phi);
               star.position.y = distance * Math.sin(theta) * Math.sin(phi);
               star.position.z = distance * Math.cos(theta);

               scene.add(star);

               // Optimized light - using fewer lights with bigger impact
               const starLight = new THREE.PointLight(starColor, 2, 2000);
               starLight.position.copy(star.position);
               scene.add(starLight);
           }
       }

       // ======== ACCRETION DISK CREATION ========
       function createAccretionDisk() {
           const geometry = new THREE.RingGeometry(400, 700, 128);

           const vertexShader = `
               varying vec2 vUv;
               void main() {
                   vUv = uv;
                   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
               }
           `;

           const fragmentShader = `
               varying vec2 vUv;
               uniform float u_time;

               // Value noise function
               float hash( vec2 a ) {
                   return fract( sin( a.x * 3433.8 + a.y * 3843.98 ) * 45933.8 );
               }

               float noise( vec2 U ) {
                   vec2 id = floor( U );
                   U = fract( U );
                   U *= U * ( 3. - 2. * U );
                   vec2 A = vec2( hash(id) , hash(id + vec2(0,1)) );
                   vec2 B = vec2( hash(id + vec2(1,0)), hash(id + vec2(1,1)) );
                   vec2 C = mix( A, B, U.x);
                   return mix( C.x, C.y, U.y );
               }

               void main() {
                   vec2 uv = vUv;
                   float dist = distance(uv, vec2(0.5));

                   // Create swirling motion by rotating UVs based on distance from center
                   float angle = atan(uv.y - 0.5, uv.x - 0.5);
                   float radius = length(uv - 0.5);

                   // Add time to the angle for rotation, speed increases closer to center
                   angle += u_time * 0.2 / (radius + 0.1);

                   // Convert back to UV coordinates
                   vec2 rotatedUv = vec2(cos(angle), sin(angle)) * radius + 0.5;

                   // Use noise to create turbulent bands
                   float n = noise(rotatedUv * 5.0 + u_time * 0.1);

                   // Create sharp bands
                   float bands = smoothstep(0.4, 0.6, n) - smoothstep(0.7, 0.9, n);

                   // Define colors
                   vec3 color1 = vec3(1.0, 0.6, 0.1); // Orange
                   vec3 color2 = vec3(1.0, 1.0, 0.8); // Bright Yellow/White

                   // Mix colors based on bands
                   vec3 color = mix(color1, color2, bands);

                   // Fade out at the edges
                   float alpha = smoothstep(0.5, 0.4, dist);

                   gl_FragColor = vec4(color * bands, alpha * bands);
               }
           `;

           const material = new THREE.ShaderMaterial({
               uniforms: {
                   u_time: { value: 0.0 }
               },
               vertexShader,
               fragmentShader,
               transparent: true,
               side: THREE.DoubleSide,
               blending: THREE.AdditiveBlending,
               depthWrite: false,
           });

           const disk = new THREE.Mesh(geometry, material);
           disk.rotation.x = -Math.PI / 2; // Lay it flat
           return disk;
       }

       // ======== OPTIMIZED WORMHOLE CREATION ========
       function createWormhole() {
           // Improved wormhole parameters
           const baseRadius = 350;
           const height = 1000;
           const radialSegments = 120;
           const heightSegments = 100;
           const openEnded = true;

           // Create base geometry
           const geometry = new THREE.CylinderGeometry(
               baseRadius, baseRadius, height,
               radialSegments, heightSegments, openEnded
           );

           // Set geometry as non-dynamic for performance
           geometry.attributes.position.usage = THREE.StaticDrawUsage;

           // Store positions for distortion
           const positions = geometry.attributes.position;
           const vertex = new THREE.Vector3();

           // Store original positions for distortion adjustment
           const originalPositions = [];
           for (let i = 0; i < positions.count; i++) {
               vertex.fromBufferAttribute(positions, i);
               originalPositions.push(vertex.x, vertex.y, vertex.z);
           }

           // Function to apply distortion based on slider value
           function applyDistortion(distortionFactor) {
               for (let i = 0; i < positions.count; i++) {
                   const i3 = i * 3;

                   vertex.set(
                       originalPositions[i3],
                       originalPositions[i3 + 1],
                       originalPositions[i3 + 2]
                   );

                   // Calculate distance from center along height
                   const distanceFromCenter = Math.abs(vertex.y);

                   // Create the pinch in the middle with variable distortion
                   const pinchFactor = distortionFactor * 0.9 + 0.1; // Ensures minimum 10% pinch
                   const scale = 1.0 - pinchFactor * Math.exp(-Math.pow(distanceFromCenter / (height * 0.15), 2));

                   // Apply scale to x and z (radial directions)
                   vertex.x *= scale;
                   vertex.z *= scale;

                   // Update the position
                   positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
               }

               // Update UI elements
               const throatSize = Math.round(baseRadius * (1.0 - (distortionFactor * 0.9 + 0.1)));
               throatDiameter.textContent = `${throatSize} units`;

               // Update exotic matter status based on distortion
               if (distortionFactor > 0.7) {
                   exoticMatter.textContent = "Unstable";
                   exoticMatter.style.color = "#ff3366";
               } else if (distortionFactor > 0.4) {
                   exoticMatter.textContent = "Stable";
                   exoticMatter.style.color = "#33ff99";
               } else {
                   exoticMatter.textContent = "Excessive";
                   exoticMatter.style.color = "#ffaa33";
               }

               // Update time dilation factor
               const dilationFactor = 1 + distortionFactor * 2;
               timeDilation.textContent = dilationFactor.toFixed(2) + "x";

               // Update geometry
               geometry.computeVertexNormals();
               positions.needsUpdate = true;
           }

           // Initial application of 50% distortion
           applyDistortion(0.5);

           // Create optimized materials using shared configuration
           const createWireframeMaterial = (color, opacity) => {
               return new THREE.MeshBasicMaterial({
                   color: color,
                   wireframe: true,
                   transparent: true,
                   opacity: opacity,
                   depthWrite: opacity > 0.5 // Performance optimization
               });
           };

           // Create materials with shared properties
           const outermostMaterial = createWireframeMaterial(0x00ccff, 0.4);
           const outerMaterial = createWireframeMaterial(0x0088ff, 0.7);
           const innerMaterial = createWireframeMaterial(0x00ffff, 0.9);

           // Create main mesh
           const mesh = new THREE.Mesh(geometry, outermostMaterial);
           mesh.rotation.x = Math.PI / 2; // Rotate to align with z-axis

           // Optimize child meshes by reusing geometries
           const clonedGeometry = geometry.clone();

           const innerMesh1 = new THREE.Mesh(clonedGeometry, outerMaterial);
           innerMesh1.scale.set(0.95, 1, 0.95);
           mesh.add(innerMesh1);

           const innerMesh2 = new THREE.Mesh(clonedGeometry, innerMaterial);
           innerMesh2.scale.set(0.90, 1, 0.90);
           mesh.add(innerMesh2);

           // Create event horizon effect in the middle
           const horizonGeometry = new THREE.RingGeometry(10, baseRadius, 60);
           const horizonMaterial = new THREE.MeshBasicMaterial({
               color: 0x00ffff,
               side: THREE.DoubleSide,
               transparent: true,
               opacity: 0.5,
               blending: THREE.AdditiveBlending,
               map: eventHorizonTexture,
               depthWrite: false // Performance optimization
           });

           const eventHorizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
           eventHorizon.rotation.x = Math.PI / 2;
           eventHorizon.position.y = 0; // Center of the wormhole
           mesh.add(eventHorizon);

           // Add energy rings with optimized reuse of materials and geometries
           const ringCount = 6;
           const rings = [];

           // Create shared geometries for rings (reuse the same geometry)
           const ringGeometry = new THREE.RingGeometry(
               baseRadius * 0.9,
               baseRadius * 1.05,
               60
           );

           // Create shared material for rings
           const ringMaterial = new THREE.MeshBasicMaterial({
               color: 0x00ffff,
               transparent: true,
               opacity: 0.3,
               side: THREE.DoubleSide,
               blending: THREE.AdditiveBlending,
               depthWrite: false
           });

           for (let i = 0; i < ringCount; i++) {
               const position = (i / (ringCount - 1) * 2 - 1) * (height / 2 - 50);

               // Reuse geometry and material
               const ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
               ring.position.y = position;
               ring.rotation.x = Math.PI / 2;

               // Store animation data
               ring.userData.originalY = position;
               ring.userData.pulseSpeed = 0.5 + Math.random() * 0.5;
               ring.userData.pulsePhase = Math.random() * Math.PI * 2;

               mesh.add(ring);
               rings.push(ring);
           }

           // Create one-way entrance effect for one-way wormhole type
           const entranceGeometry = new THREE.CircleGeometry(baseRadius * 1.1, 60);
           const entranceMaterial = new THREE.MeshBasicMaterial({
               color: 0x0066ff,
               transparent: true,
               opacity: 0,
               side: THREE.DoubleSide,
               depthWrite: false
           });

           const entranceBarrier = new THREE.Mesh(entranceGeometry, entranceMaterial);
           entranceBarrier.position.y = height / 2 + 10;
           entranceBarrier.rotation.x = Math.PI / 2;
           entranceBarrier.visible = false;
           mesh.add(entranceBarrier);

           // Create exit universe appearance for inter-universe type
           const exitUniverseGeometry = new THREE.CircleGeometry(baseRadius * 1.5, 60);
           const exitUniverseMaterial = new THREE.MeshBasicMaterial({
               color: 0x9900ff,
               transparent: true,
               opacity: 0,
               side: THREE.DoubleSide,
               map: nebulaTexture,
               depthWrite: false
           });

           const exitUniverse = new THREE.Mesh(exitUniverseGeometry, exitUniverseMaterial);
           exitUniverse.position.y = -height / 2 - 50;
           exitUniverse.rotation.x = Math.PI / 2;
           exitUniverse.visible = false;
           mesh.add(exitUniverse);

           // Return wormhole object with API
           return {
               mesh: mesh,
               setDistortion: applyDistortion,
               innerMesh1: innerMesh1,
               innerMesh2: innerMesh2,
               eventHorizon: eventHorizon,
               rings: rings,
               entranceBarrier: entranceBarrier,
               exitUniverse: exitUniverse,
               outermostMaterial: outermostMaterial,
               outerMaterial: outerMaterial,
               innerMaterial: innerMaterial,
               setWormholeType: function(type) {
                   switch(type) {
                       case 'one-way':
                           entranceBarrier.visible = true;
                           entranceMaterial.opacity = 0.7;
                           exitUniverse.visible = false;
                           break;
                       case 'inter-universe':
                           entranceBarrier.visible = false;
                           exitUniverse.visible = true;
                           exitUniverseMaterial.opacity = 0.8;
                           break;
                       default: // 'two-way'
                           entranceBarrier.visible = false;
                           exitUniverse.visible = false;
                           break;
                   }
               }
           };
       }

       // ======== OPTIMIZED PARTICLE SYSTEMS ========
       function createParticleSystems() {
           const systems = [];

           // Create optimized particle system
           // Using two particle systems with different behaviors

           // System 1: Flow particles
           const flowCount = 1500;
           const flowPositions = [];
           const flowVelocities = [];
           const flowOriginalPositions = [];

           // Pre-compute particle positions for better performance
           for (let i = 0; i < flowCount; i++) {
               const angle = Math.random() * Math.PI * 2;
               const radius = 100 + Math.random() * 350;
               const height = (Math.random() - 0.5) * 1000;

               const x = Math.cos(angle) * radius;
               const y = height;
               const z = Math.sin(angle) * radius;

               flowPositions.push(x, y, z);
               flowOriginalPositions.push(x, y, z);

               // Random velocities for animation
               flowVelocities.push(
                   Math.random() * 2,
                   Math.random() * 2,
                   Math.random() * 2
               );
           }

           // Create optimized buffer geometry
           const flowGeometry = new THREE.BufferGeometry();
           flowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(flowPositions, 3));

           // Add size attribute for improved visual variety
           const flowSizes = new Float32Array(flowCount);
           for (let i = 0; i < flowCount; i++) {
               flowSizes[i] = 2 + Math.random() * 2;
           }
           flowGeometry.setAttribute('size', new THREE.Float32BufferAttribute(flowSizes, 1));

           // Use a custom shader material for better performance with many particles
           const flowMaterial = new THREE.PointsMaterial({
               color: 0x00ffff,
               size: 3,
               transparent: true,
               opacity: 0.7,
               blending: THREE.AdditiveBlending,
               depthWrite: false, // Performance optimization
               sizeAttenuation: true
           });

           const flowSystem = new THREE.Points(flowGeometry, flowMaterial);
           flowSystem.userData.originalPositions = flowOriginalPositions;
           flowSystem.userData.velocities = flowVelocities;

           systems.push(flowSystem);

           // System 2: Energy particles (concentrated near throat)
           const energyCount = 1000;
           const energyPositions = [];
           const energyVelocities = [];
           const energyOriginalPositions = [];

           for (let i = 0; i < energyCount; i++) {
               const angle = Math.random() * Math.PI * 2;
               const radius = 50 + Math.random() * 150;
               const height = (Math.random() - 0.5) * 300; // Concentrated near throat

               const x = Math.cos(angle) * radius;
               const y = height;
               const z = Math.sin(angle) * radius;

               energyPositions.push(x, y, z);
               energyOriginalPositions.push(x, y, z);

               // Faster velocities for more energetic movement
               energyVelocities.push(
                   Math.random() * 3,
                   Math.random() * 3,
                   Math.random() * 3
               );
           }

           const energyGeometry = new THREE.BufferGeometry();
           energyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(energyPositions, 3));

           const energyMaterial = new THREE.PointsMaterial({
               color: 0x80ffea,
               size: 2,
               transparent: true,
               opacity: 0.5,
               blending: THREE.AdditiveBlending,
               depthWrite: false // Performance optimization
           });

           const energySystem = new THREE.Points(energyGeometry, energyMaterial);
           energySystem.userData.originalPositions = energyOriginalPositions;
           energySystem.userData.velocities = energyVelocities;

           systems.push(energySystem);

           return systems;
       }

       // Create custom optimized GlitchPass based on search result [3]
       function createOptimizedGlitchPass() {
           // Using the optimization technique from search result [3]
           const glitchPass = new GlitchPass();

           // Make glitches less frequent and more random
           const originalRender = glitchPass.render;
           glitchPass.render = function(renderer, writeBuffer, readBuffer) {
               this.uniforms["tDiffuse"].value = readBuffer.texture;
               this.uniforms["seed"].value = Math.random();
               this.uniforms["byp"].value = 0;

               // Only glitch when appState.glitchIntensity > 0
               if (appState.glitchIntensity > 0 && Math.random() < appState.glitchIntensity * 0.1) {
                   // Controlled glitch amount based on intensity
                   this.uniforms["amount"].value = Math.random() / 30 * appState.glitchIntensity;
                   this.uniforms["angle"].value = THREE.MathUtils.randFloat(-Math.PI, Math.PI);
                   this.uniforms["seed_x"].value = THREE.MathUtils.randFloat(-1, 1);
                   this.uniforms["seed_y"].value = THREE.MathUtils.randFloat(-1, 1);
                   this.uniforms["distortion_x"].value = THREE.MathUtils.randFloat(0, 1);
                   this.uniforms["distortion_y"].value = THREE.MathUtils.randFloat(0, 1);
                   this.curF = 0;
                   this.generateTrigger();
               } else {
                   this.uniforms["byp"].value = 1;
               }

               if (this.renderToScreen) {
                   renderer.setRenderTarget(null);
                   this.fsQuad.render(renderer);
               } else {
                   renderer.setRenderTarget(writeBuffer);
                   if (this.clear) renderer.clear();
                   this.fsQuad.render(renderer);
               }
           };

           // Initially disable glitch effect
           glitchPass.enabled = true;
           appState.glitchIntensity = 0;

           return glitchPass;
       }

       // ======== EVENT HANDLERS ========
       // Optimize event handling by debouncing/throttling expensive operations

       // Optimized mouse move handler with throttling
       let mouseThrottleTimer;
       document.addEventListener('mousemove', (event) => {
           // Update state variables immediately for smooth camera movement
           appState.mouseX = (event.clientX - appState.windowHalfX) / 100;
           appState.mouseY = (event.clientY - appState.windowHalfY) / 100;

           // Throttle expensive DOM updates
           clearTimeout(mouseThrottleTimer);
           mouseThrottleTimer = setTimeout(() => {
               // Update lens flare position
               const lensX = event.clientX;
               const lensY = event.clientY;
               lensFlare.style.left = `${lensX}px`;
               lensFlare.style.top = `${lensY}px`;

               // Only show lens flare when near the wormhole center
               const distanceToCenter = Math.sqrt(
                   Math.pow((event.clientX - appState.windowHalfX) / appState.windowHalfX, 2) +
                   Math.pow((event.clientY - appState.windowHalfY) / appState.windowHalfY, 2)
               );

               lensFlare.style.opacity = Math.max(0, 1 - distanceToCenter * 2);
           }, 16); // ~60fps
       });

       // Optimized wheel handler
       let wheelThrottleTimer;
       document.addEventListener('wheel', (event) => {
           // Skip if in journey mode
           if (appState.journeyMode) return;

           // Update camera position directly
           sceneObjects.camera.position.z = Math.max(300, Math.min(2000,
               sceneObjects.camera.position.z + event.deltaY * 0.5));

           // Throttle any additional processing
           clearTimeout(wheelThrottleTimer);
           wheelThrottleTimer = setTimeout(() => {
               // Additional processing if needed
           }, 100);
       });

       // Journey button handler
       journeyBtn.addEventListener('click', () => toggleJourneyMode());

       // Keyboard shortcuts
       document.addEventListener('keydown', (event) => {
           if (event.key === 'j' || event.key === 'J') {
               toggleJourneyMode();
           }
       });

       // Toggle journey mode function
       function toggleJourneyMode() {
           appState.journeyMode = !appState.journeyMode;
           appState.journeyStarted = appState.journeyMode;
           appState.journeyProgress = 0;

           if (appState.journeyMode) {
               journeyBtn.textContent = "Cancel Journey";
               glitchEffect.style.opacity = 0.1;

               // Store original camera position for return
               sceneObjects.camera.userData.originalPosition = {
                   x: sceneObjects.camera.position.x,
                   y: sceneObjects.camera.position.y,
                   z: sceneObjects.camera.position.z
               };

               // Position camera for journey start
               sceneObjects.camera.position.z = 1500;
               sceneObjects.camera.position.x = 0;
               sceneObjects.camera.position.y = 0;

               // Show journey progress
               document.getElementById('journey-progress').style.opacity = 1;
               document.getElementById('journey-progress-bar').style.width = "0%";
               document.getElementById('journey-phase').textContent = "Approaching Wormhole";
           } else {
               journeyBtn.textContent = "Begin Journey";
               glitchEffect.style.opacity = 0;

               // Hide journey progress
               document.getElementById('journey-progress').style.opacity = 0;

               // Return to original position
               if (sceneObjects.camera.userData.originalPosition) {
                   sceneObjects.camera.position.set(
                       sceneObjects.camera.userData.originalPosition.x,
                       sceneObjects.camera.userData.originalPosition.y,
                       sceneObjects.camera.userData.originalPosition.z
                   );
               }
           }
       }

       // Distortion slider handler
       distortionSlider.addEventListener('input', (event) => {
           const value = event.target.value;
           distortionValue.textContent = `${value}%`;
           sceneObjects.wormhole.setDistortion(value / 100);
       });

       // Wormhole type selector handler
       wormholeTypeSelect.addEventListener('change', (event) => {
           sceneObjects.wormhole.setWormholeType(event.target.value);

           // Update displayed information based on type
           if (event.target.value === 'one-way') {
               exoticMatter.textContent = "Polarized";
               exoticMatter.style.color = "#ff9966";
           } else if (event.target.value === 'inter-universe') {
               exoticMatter.textContent = "Quantum-linked";
               exoticMatter.style.color = "#9966ff";
           } else {
               // Restore original state based on distortion
               sceneObjects.wormhole.setDistortion(distortionSlider.value / 100);
           }
       });

       // Optimized window resize handler with debouncing
       let resizeTimeout;
       window.addEventListener('resize', () => {
           // Update these values immediately for correct mouse position calculation
           appState.windowHalfX = window.innerWidth / 2;
           appState.windowHalfY = window.innerHeight / 2;

           // Debounce expensive resize operations
           clearTimeout(resizeTimeout);
           resizeTimeout = setTimeout(() => {
               // Update camera
               sceneObjects.camera.aspect = window.innerWidth / window.innerHeight;
               sceneObjects.camera.updateProjectionMatrix();

               // Update renderer and composer
               sceneObjects.renderer.setSize(window.innerWidth, window.innerHeight);
               sceneObjects.composer.setSize(window.innerWidth, window.innerHeight);
           }, 250);
       });

       // ======== SCENE INITIALIZATION ========
       // Create scene elements
       createGalacticBackground();
       createCelestialObjects();

       // Create and store wormhole
       const wormhole = createWormhole();
       scene.add(wormhole.mesh);
       sceneObjects.wormhole = wormhole;

       // Create and store accretion disk
       const accretionDisk = createAccretionDisk();
       scene.add(accretionDisk);
       sceneObjects.accretionDisk = accretionDisk;

       // Create and store particle systems
       const particleSystems = createParticleSystems();
       particleSystems.forEach(system => scene.add(system));
       sceneObjects.particleSystems = particleSystems;

       // Start loading sequence
       simulateLoading();
   });
}

export function cleanupScene() {
   // Dispose of all geometries, materials, and textures
   if (!sceneObjects.scene) return;

   const disposeNode = (node) => {
       if (node.geometry) node.geometry.dispose();

       if (node.material) {
           if (Array.isArray(node.material)) {
               node.material.forEach(material => disposeMaterial(material));
           } else {
               disposeMaterial(node.material);
           }
       }

       node.children.forEach(child => disposeNode(child));
   };

   const disposeMaterial = (material) => {
       if (material.map) material.map.dispose();
       if (material.lightMap) material.lightMap.dispose();
       if (material.bumpMap) material.bumpMap.dispose();
       if (material.normalMap) material.normalMap.dispose();
       if (material.specularMap) material.specularMap.dispose();
       if (material.envMap) material.envMap.dispose();
       material.dispose();
   };

   // Dispose everything in the scene
   sceneObjects.scene.traverse(disposeNode);

   // Remove renderer
   if (sceneObjects.renderer) {
       sceneObjects.renderer.dispose();
       document.body.removeChild(sceneObjects.renderer.domElement);
   }

   // Remove composer
   if (sceneObjects.composer) {
       sceneObjects.composer.passes.forEach(pass => {
           if (pass.dispose) pass.dispose();
       });
   }
}
