# Vibing Crystal Defender - Architecture Documentation

## Project Overview
Vibing Crystal Defender is a Tower Defense FPS game built with Three.js, featuring both desktop and mobile support. The game combines first-person shooter mechanics with tower defense strategy, where players must protect a central crystal from waves of enemies.

## Directory Structure
```
VibingCrystalDefender/
├── assets/
│   ├── models/      # 3D models
│   ├── textures/    # Game textures
│   ├── sounds/      # Audio files
│   └── images/      # UI and misc images
├── css/
│   └── style.css    # Game styles
├── js/
│   ├── core/        # Core game components
│   │   ├── game.js          # Main game manager
│   │   ├── renderer.js      # Three.js scene management
│   │   ├── player.js        # Player controls and mechanics
│   │   ├── language.js      # Internationalization system
│   │   ├── enemy.js         # Enemy management
│   │   └── projectile.js    # Projectile management
│   ├── config/      # Configuration files
│   │   └── settings.js      # Game settings and constants
│   └── utils/       # Utility functions
│       └── helpers.js       # Helper functions
├── docs/
│   └── memory-bank/  # Documentation
├── index.html        # Main entry point
└── README.md         # Project documentation
```

## Core Components

### 1. Game Manager (`game.js`)
- Central controller for game state and systems
- Manages game initialization and loop
- Coordinates between different components
- Handles character selection and game states

```javascript
class VibingCrystalDefender {
    constructor()
    initialize()
    startGame()
    setupCharacterSelection()
    animate()
}
```

### 2. Renderer (`renderer.js`)
- Manages Three.js scene, camera, and renderer
- Handles window resizing
- Controls lighting and visual effects
- Manages game environment (floor, grid, skybox)
- Creates and maintains the central crystal with highlighting effects

```javascript
class Renderer {
    constructor()
    initialize()
    setupScene()
    setupCamera()
    setupRenderer()
    createFloor()
    createCrystal()
    setupLighting()
    render()
}
```

### 3. Player Controller (`player.js`)
- Handles player movement and controls
- Manages character classes and abilities
- Implements both desktop and mobile controls
- Controls camera perspective and collision

```javascript
class Player {
    constructor()
    initialize()
    setupControls()
    setupMobileControls()
    updateMovement()
    setPlayerClass()
}
```

### 4. Language System (`language.js`)
- Manages game translations
- Handles language switching
- Provides translation utilities
- Supports multiple languages (PT-BR, EN)

```javascript
class LanguageManager {
    constructor()
    setLanguage()
    translate()
    updateUI()
}
```

### 5. Enemy Manager (`enemy.js`)
- Manages enemy pooling, spawning, and movement
- Controls enemy behavior and lifecycle
- Handles spawn points and enemy activation
- Directs enemies toward the crystal

```javascript
class EnemyManager {
    constructor()
    initializeEnemyPool()
    spawnEnemy()
    getInactiveEnemy()
    deactivateEnemy()
    updateEnemies()
    spawnRandomEnemy()
}
```

### 6. Projectile Manager (`projectile.js`)
- Manages projectile creation, movement, and collision
- Handles projectile types and behaviors
- Controls projectile spawning and removal

```javascript
class ProjectileManager {
    constructor()
    createProjectile()
    updateProjectiles()
    handleCollision()
}
```

## Configuration System

### Settings (`settings.js`)
Centralizes game configuration:
- Renderer settings
- Player properties
- Arena dimensions
- Camera parameters
- Game states
- CDN URLs

## Utility Functions (`helpers.js`)
- Window resize handling
- Mobile device detection
- Debug logging
- Material creation helpers

## Control Systems

### Desktop Controls
- WASD/Arrow keys for movement
- Mouse for camera rotation
- Pointer lock for FPS view
- Keyboard shortcuts for actions

### Mobile Controls
- Dual virtual joysticks
  - Left: Movement control
  - Right: Camera rotation
- Touch-friendly UI
- Responsive design adaptations
- Automatic control switching

## User Interface

### Character Selection
- Three playable classes
  - Warrior (Melee combat)
  - Archer (Ranged attacks)
  - Mage (Area spells)
- Visual class selection
- Start game button
- Language selection

### Game UI
- Health indicators
- Resource counters
- Tower building interface
- Mobile control overlays
- Touch instructions

## Dependencies
- Three.js: 3D rendering
- PointerLockControls: Camera control
- Nipple.js: Mobile joysticks
- No build process required
- CDN-based deployment

## Implemented Systems

### 1. Crystal System
- Central game element that players must defend
- Implemented as a semi-transparent, glowing sphere
- Features:
  - Located at the center of the arena (0, 2, 0)
  - Slow rotation animation for visual appeal
  - Custom material with transparency and shininess
  - Dedicated point light source for highlighting
  - Health tracking system with configurable initial value
  - Visual damage feedback with temporary color change
  - Game over detection when health depletes

### 2. Enemy System
- Handles spawning and movement of enemies toward the crystal
- Implemented using an object pooling design pattern for performance
- Features:
  - Configurable pool size (default: 20 enemies)
  - Four cardinal spawn points at arena boundaries
  - Direct movement toward the crystal
  - Automatic spawning at timed intervals
  - Simple red cube representation (placeholder)
  - Configurable movement speed and health values
  - Collision detection with the crystal
  - State-based behavior (moving or attacking)
  - Timed attack system with consistent damage rate

### 3. Health and Damage System
- Manages crystal health and enemy attacks
- Components:
  - **Crystal Health:** Tracks current and maximum health values
  - **Damage Application:** Reduces health when enemies attack
  - **Visual Feedback:** Crystal changes color briefly when damaged
  - **UI Display:** Shows current health percentage with a health bar
  - **Game Over Handling:** Detects when crystal is destroyed

### 4. UI System
- Provides visual information to the player
- Elements:
  - Character selection menu
  - Language selector
  - Crystal health display:
    - Progress bar showing percentage of health remaining
    - Numerical percentage display
    - Updates in real-time as crystal takes damage
  - Game over screen:
    - Shows when crystal is destroyed
    - Provides restart option
    - Displays failure message
  - Enemy health bars:
    - Dynamically created for each active enemy
    - Follow enemies in 3D space with screen projection
    - Show health percentage with color coding
    - Scale with distance for better visibility
    - Update in real-time when enemies take damage
  - Wave information display:
    - Current wave number
    - Enemy count (defeated/total)
    - Next wave countdown timer

### 5. Wave System
- Manages enemy spawning in discrete waves
- Components:
  - **Wave Tracking:** Manages current wave number and progress
  - **Enemy Counting:** Tracks spawned and defeated enemies per wave
  - **Dynamic Difficulty:** Increases enemy count each wave
  - **Wave Timing:** Controls delays between waves with countdown
  - **UI Display:** Shows current wave, enemy count, and next wave timer
  - **Directional Spawning:** Spawns enemies from all four cardinal directions

### Player Movement System
- Manages player movement using camera-relative coordinates
- Components:
  - **Directional Vectors:** Calculates forward and right vectors based on camera orientation
  - **Input Mapping:** Maps WASD/Arrow keys and joystick input to these vectors
  - **Velocity Application:** Applies combined movement with delta-time for smooth motion
  - **Boundary Enforcement:** Ensures player stays within the arena boundaries
- Implementation:
  - Desktop: WASD/Arrow keys trigger direction flags processed in the update loop
  - Mobile: Joystick input directly affects velocity calculation
  - All movement is based on camera orientation rather than world axes

```javascript
// Camera-relative movement calculation
updateMovement(delta) {
  // Get camera direction and calculate perpendicular vectors
  const cameraDirection = new THREE.Vector3();
  this.camera.getWorldDirection(cameraDirection);
  
  // Project onto XZ plane for movement
  const forwardVector = new THREE.Vector3(
    cameraDirection.x, 
    0, 
    cameraDirection.z
  ).normalize();
  
  // Calculate right vector (perpendicular to forward)
  const rightVector = new THREE.Vector3(
    forwardVector.z,
    0,
    -forwardVector.x
  ).normalize();
  
  // Apply input to these vectors for movement
  if (this.moveForward) {
    this.velocity.add(forwardVector.clone().multiplyScalar(this.speed));
  }
  // Additional movement logic...
}
```

The movement system now uses the camera's orientation as the reference point for all movement, making controls more intuitive and consistent between desktop and mobile platforms. This creates a more natural control scheme where "forward" always means "the direction the player is looking."

## Implementation Details

### Crystal Health System
```javascript
// Crystal health properties in settings.js
crystal: {
  health: 100,    // Initial crystal health
  radius: 2,      // Crystal radius for collision detection
  blinkOnDamage: true, // Visual feedback when damaged
  position: { x: 0, y: 2, z: 0 } // Central position
}

// Crystal damage handling in renderer.js
takeDamage(damage) {
  // Reduce crystal health
  this.crystalHealth -= damage;
  
  // Play damage animation if enabled
  if (settings.crystal.blinkOnDamage) {
    this.playDamageAnimation();
  }
  
  // Check if crystal is destroyed
  if (this.crystalHealth <= 0) {
    this.gameOver();
  }
}
```

### Enemy Attack System
```javascript
// Enemy attack properties in settings.js
enemies: {
  attackDamage: 1, // Damage per second
  attackRange: 3   // Distance to start attacking
}

// Enemy attack logic in enemy.js
updateEnemies(delta, currentTime) {
  this.activeEnemies.forEach(enemy => {
    // Calculate distance to crystal
    const distanceToCrystal = enemy.position.distanceTo(crystalPosition);
    
    // Check if enemy is within attack range of crystal
    if (distanceToCrystal <= settings.enemies.attackRange) {
      // Enemy stops and attacks once per second
      if (currentTime - enemy.userData.lastAttackTime >= 1000) {
        this.attackCrystal(enemy);
        enemy.userData.lastAttackTime = currentTime;
      }
    } else {
      // Continue moving toward crystal
      // Movement code...
    }
  });
}
```

### Game Over Handling
```javascript
// In renderer.js
gameOver() {
  this.isGameOver = true;
  
  // Call game over callback if defined
  if (typeof this.onGameOver === 'function') {
    this.onGameOver();
  }
}

// In game.js
handleGameOver() {
  // Create game over screen
  // Display message and restart button
  // Stop the game loop
  this.isGameRunning = false;
}
```

### Enemy Health Bar System
```javascript
// 3D to 2D position projection in enemy.js
projectPositionToScreen(position) {
  if (!this.camera) return { x: 0, y: 0 };
  
  // Clone the position to avoid modifying the original
  const pos = position.clone();
  
  // Project the 3D position to normalized device coordinates
  pos.project(this.camera);
  
  // Convert to screen coordinates
  return {
    x: (pos.x * 0.5 + 0.5) * window.innerWidth,
    y: (-pos.y * 0.5 + 0.5) * window.innerHeight
  };
}

// Health bar update logic
updateHealthBarValue(enemy) {
  // Calculate health percentage
  const healthPercent = (enemy.userData.health / enemy.userData.maxHealth) * 100;
  
  // Update width of health bar
  healthBarElements.bar.style.width = `${healthPercent}%`;
  
  // Update color based on health percentage
  if (healthPercent > 60) {
    healthBarElements.bar.style.backgroundColor = '#4CAF50'; // Green
  } else if (healthPercent > 30) {
    healthBarElements.bar.style.backgroundColor = '#FFC107'; // Yellow
  } else {
    healthBarElements.bar.style.backgroundColor = '#F44336'; // Red
  }
}
```

The health bar system creates HTML elements for each enemy, positions them based on the 3D world coordinates projected to screen space, and updates them in real-time as enemies move or take damage. This creates a seamless connection between the 3D game world and the 2D interface.

## Future Architecture

### Planned Components
1. ~~Crystal System~~ (Implemented)
   - ~~Visual representation~~ 
   - Health management (Implemented)
   - Damage handling (Implemented)

2. Enemy System (Implemented)
   - ~~Different enemy types~~ (Basic enemies implemented)
   - ~~Wave management~~ (Basic timed spawning implemented)
   - ~~Pathfinding~~ (Direct movement implemented)

3. Tower System
   - Building mechanics
   - Upgrade system
   - Different tower types

4. Combat System
   - Damage calculation
   - Projectile management
   - Collision detection

5. Resource System
   - Currency management
   - Resource collection
   - Economy balance
