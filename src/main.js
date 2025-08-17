import { initScene } from './setup.js';
import { initAnimation } from './animation.js';

// Add specific error handler for script loading errors
window.addEventListener('error', function(event) {
  console.error('Script error:', event.error);
  const loadingStatus = document.getElementById('loading-status');
  if (loadingStatus) {
    loadingStatus.textContent = "Error loading wormhole: " + (event.error ? event.error.message : "Unknown error");
  }
}, { once: false, capture: true });

// Initialize application after DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize scene and wait for completion
    await initScene();
    // Start animation loop
    initAnimation();
  } catch (error) {
    console.error('Initialization error:', error);

    // Update loading status with error message
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) {
      loadingStatus.textContent = "Error initializing wormhole: " + error.message;
    }

    // Optionally hide loading screen after error
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    }, 300);
  }
});
