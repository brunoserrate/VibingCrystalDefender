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
│   │   └── language.js      # Internationalization system
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
  - Will track health and status in future implementations

## Future Architecture

### Planned Components
1. ~~Crystal System~~ (Implemented)
   - ~~Visual representation~~ 
   - Health management (Coming next)
   - Damage handling

2. Enemy System
   - Different enemy types
   - Wave management
   - Pathfinding

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
