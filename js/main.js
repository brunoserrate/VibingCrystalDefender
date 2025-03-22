/**
 * Main entry point for Vibing Crystal Defender
 * Initializes the game when the DOM is fully loaded
 */

import { VibingCrystalDefender } from './core/game.js';

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing game...");
    
    // Create game instance
    window.game = new VibingCrystalDefender();
    
    // Game will initialize after character selection
    console.log("Game instance created. Please select a character to start.");
});
