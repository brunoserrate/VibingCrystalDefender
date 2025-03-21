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
│   └── lang/
│       └── translations.json # Translations for UI elements
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
   - Stores and utilizes player class selection

4. **Language Manager** (`game.js` - LanguageManager class)
   - Loads and manages translations from JSON file
   - Handles language switching (Portuguese/English)
   - Provides translation functions for UI elements
   - Maps class names between languages
   - Applies translations to DOM elements via data-i18n attributes

5. **Character Selection System** (Implemented in HTML/CSS/JS)
   - Provides character class options (Warrior, Archer, Mage)
   - Handles selection UI with visual feedback
   - Stores selected class for game mechanics
   - Integrates with Language Manager for localized display

6. **Enemy System** (To be implemented)
   - Will handle enemy spawning
   - Enemy movement
   - Enemy-crystal interactions

7. **Crystal Component** (To be implemented)
   - Will manage crystal state
   - Handle crystal health
   - Process crystal effects

8. **UI Component** (Partially implemented)
   - Character selection menu
   - Language selector
   - Will create and update additional user interface elements
   - Display player stats and game information

## Data Flow

The application follows this data flow:

1. User selects language (PT/EN) via language toggle
2. User selects character class in the character selection menu
3. Game starts when user clicks "Start Game" button
4. Character selection menu is hidden, 3D scene is rendered
5. User controls (keyboard/mouse or touch) are processed for player movement
6. Game state is updated in the animation loop

## Internationalization (i18n) System

The game includes a robust translation system:

1. **Translation Storage**:
   - JSON file (`assets/lang/translations.json`) contains all UI strings
   - Organized by categories (menu, UI, gameplay) and languages (pt-br, en)
   - Nested structure allows for logical grouping of related strings

2. **Language Manager**:
   - Loads translations asynchronously on game start
   - Provides a `get()` method to retrieve translations by key
   - Handles language switching with UI updates
   - Dispatches events when language changes

3. **Translation Application**:
   - UI elements use `data-i18n` attributes referencing translation keys
   - Auto-translation of UI when language changes
   - Translation of gameplay terms and character classes

This architecture follows a component-based approach, allowing for modularity and easier maintenance as the project grows.
