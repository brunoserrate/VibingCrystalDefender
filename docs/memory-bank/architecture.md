# Vibing Crystal Defender - Architecture Documentation

## Project Structure

```
VibingCrystalDefender/
├── index.html                # Main HTML file with game container
├── css/
│   └── style.css             # Basic styling for the game
├── js/
│   └── game.js               # Main game logic
├── assets/                   # Will contain game assets (models, textures, sounds)
└── docs/                     # Documentation
    └── memory-bank/          # Project documentation files
```

## Technologies Used

As specified in the Tech Stack document:

1. **Three.js** - For 3D rendering
   - Loaded via CDN: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js`
   - Will be used for creating the 3D world, models, and camera

2. **JavaScript** - Pure JavaScript for game logic
   - No additional frameworks to keep the project lightweight
   - Organized in a class-based structure for maintainability

3. **Nipple.js** - For virtual joystick
   - Loaded via CDN: `https://cdnjs.cloudflare.com/ajax/libs/nipplejs/0.8.6/nipplejs.min.js`
   - Will be used for handling touch controls on mobile devices

## Component Architecture

The game follows this high-level component structure:

1. **Game Manager** (`game.js` - VibingCrystalDefender class)
   - Initializes the game environment
   - Manages game states (menu, playing, game over)
   - Orchestrates other components

2. **Renderer Component** (Implemented in `game.js`)
   - Handles Three.js scene setup
   - Camera configuration
   - Rendering loop with requestAnimationFrame
   - Responsive design with window resize handling

3. **Player Component** (Implemented in `game.js`)
   - Manages player movement
   - Handles player inputs
   - Processes player actions

4. **Enemy System** (To be implemented)
   - Will handle enemy spawning
   - Enemy movement
   - Enemy-crystal interactions

5. **Crystal Component** (To be implemented)
   - Will manage crystal state
   - Handle crystal health
   - Process crystal effects

6. **UI Component** (To be implemented)
   - Will create and update user interface elements
   - Display player stats and game information

This architecture follows a component-based approach, allowing for modularity and easier maintenance as the project grows.
