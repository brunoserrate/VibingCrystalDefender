/**
 * Helper functions for the Vibing Crystal Defender game
 */

/**
 * Handles window resize for responsive rendering
 * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
 * @param {THREE.Camera} camera - The game camera
 */
export function handleResize(renderer, camera) {
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

/**
 * Detects if the device is mobile based on user agent or screen size
 * @returns {boolean} - True if the device is mobile
 */
export function detectMobileDevice() {
  // Check if the user agent contains mobile identifiers
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Touch/i.test(navigator.userAgent);
  
  // Check if touch is available
  const hasTouch = 'ontouchstart' in window || 
                  navigator.maxTouchPoints > 0 || 
                  navigator.msMaxTouchPoints > 0;
  
  // Check if the screen size is typical for mobile devices
  const smallScreen = window.innerWidth < 768 || window.innerHeight < 600;
  
  // Check if the orientation API is available (mostly on mobile)
  const hasOrientation = typeof window.orientation !== 'undefined';
  
  // Force mobile mode on some tablets that might be detected as desktop
  const tabletSize = window.innerWidth <= 1024 && window.innerHeight <= 1366;
  
  // Log the detection parameters
  console.log(`Mobile detection: UA=${mobileUA}, Touch=${hasTouch}, SmallScreen=${smallScreen}, Orientation=${hasOrientation}, TabletSize=${tabletSize}`);
  
  return mobileUA || (hasTouch && (smallScreen || hasOrientation || tabletSize));
}

/**
 * Logs debug information if debug mode is enabled
 * @param {string} message - The debug message
 * @param {any} data - Additional data to log
 * @param {boolean} isError - Whether this is an error message
 * @param {Object} debugConfig - Debug configuration options
 */
export function debugLog(message, data = null, isError = false, debugConfig = { enabled: false, errorLogEnabled: false }) {
  if (!debugConfig.enabled && (!isError || !debugConfig.errorLogEnabled)) {
    return;
  }
  
  if (isError) {
    console.error(`[DEBUG ERROR] ${message}`, data);
  } else {
    console.log(`[DEBUG] ${message}`, data);
  }
}

/**
 * Creates and returns a simple color material
 * @param {number} color - The hex color for the material
 * @returns {THREE.MeshStandardMaterial} - The created material
 */
export function createColorMaterial(color) {
  return new THREE.MeshStandardMaterial({ color });
}
