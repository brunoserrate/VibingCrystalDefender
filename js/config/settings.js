/**
 * Game settings and configuration
 * Centralized configuration for the Vibing Crystal Defender game
 */

export const settings = {
  // Renderer settings
  renderer: {
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    shadowMap: true
  },

  // Player settings
  player: {
    height: 1.8,
    speed: 0.15,
    mobileSpeed: 0.08,
    mobileTouchSensitivity: 0.003,
    joystickDeadZone: 0.1,
    mobileLookSensitivity: 0.03
  },

  // Arena settings
  arena: {
    size: 100,
    boundary: 50
  },

  // Camera settings
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 1.8, z: 0 }
  },

  // Game states
  states: {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
  },

  // CDN URLs for external libraries
  cdns: {
    threeJs: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js',
    pointerLockControls: 'https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/controls/PointerLockControls.js',
    nippleJs: 'https://cdnjs.cloudflare.com/ajax/libs/nipplejs/0.9.0/nipplejs.min.js'
  },

  // Language settings
  language: {
    default: 'en',
    available: ['pt-br', 'en']
  },

  // Enemy settings
  enemies: {
    poolSize: 20,  // Maximum number of enemies in the pool
    speed: 2,      // Base movement speed
    health: 100,   // Base health points
    spawnDelay: 5, // Time in seconds between spawns during testing
    attackDamage: 1, // Damage dealt per second to crystal
    attackRange: 3 // Distance at which enemies start attacking the crystal
  },

  // Crystal settings
  crystal: {
    health: 100,    // Initial crystal health
    radius: 2,      // Crystal radius for collision detection
    blinkOnDamage: true, // Visual feedback when damaged
    position: { x: 0, y: 2, z: 0 } // Central position
  },

  // Wave system settings
  waves: {
    initialDelay: 10,         // Seconds before first wave starts
    delayBetweenWaves: 15,    // Seconds between waves
    enemiesFirstWave: 4,      // Enemies in the first wave (1 per direction)
    enemyIncreasePerWave: 2,  // Additional enemies per wave
    maxEnemiesPerSpawn: 4,    // Maximum enemies to spawn at once (1 per direction)
    showCountdown: true       // Show countdown between waves
  }
};
