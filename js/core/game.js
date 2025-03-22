/**
 * Main Game Manager
 * Central controller for the Vibing Crystal Defender game
 */

import { settings } from '../config/settings.js';
import { Renderer } from './renderer.js';
import { Player } from './player.js';
import { languageManager } from './language.js';
import { debugLog } from '../utils/helpers.js';

export class VibingCrystalDefender {
    constructor() {
        // Game state
        this.isGameRunning = false;
        
        // Components
        this.renderer = new Renderer();
        this.player = null;
        
        // Animation
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        
        // Debug mode
        this.debugMode = true;
        
        // Character selection
        this.playerClass = null;
        
        // Initialize character selection menu
        this.setupCharacterSelection();
        
        console.log("Game instance created, waiting for character selection");
    }
    
    setupCharacterSelection() {
        const characterCards = document.querySelectorAll('.character-card');
        const startButton = document.getElementById('start-game-btn');
        
        // Add click event to each character card
        characterCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove selected class from all cards
                characterCards.forEach(c => c.classList.remove('selected'));
                
                // Add selected class to clicked card
                card.classList.add('selected');
                
                // Store the selected class
                this.playerClass = card.getAttribute('data-class');
                console.log(`Selected character class: ${this.playerClass}`);
                
                // Enable the start button
                startButton.disabled = false;
            });
        });
        
        // Add click event to start button
        startButton.addEventListener('click', () => {
            if (this.playerClass) {
                this.startGame();
            }
        });
    }
    
    startGame() {
        console.log(`Starting game with ${this.playerClass} class`);
        
        // Hide the character selection menu
        document.getElementById('character-selection').style.display = 'none';
        
        // Initialize the game
        this.initialize();
    }
    
    initialize() {
        // Hide loading screen once we start initialization
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Initialize renderer and get scene components
        const { scene, camera, renderer } = this.renderer.initialize();
        
        // Initialize player with scene components
        this.player = new Player(camera, scene);
        this.player.initialize();
        
        // Set player class
        if (this.playerClass) {
            this.player.setPlayerClass(this.playerClass);
        }
        
        // Start the game loop
        this.isGameRunning = true;
        requestAnimationFrame(this.animate);
        
        console.log("Game initialized successfully");
    }
    
    animate() {
        if (!this.isGameRunning) return;
        
        // Request next frame
        requestAnimationFrame(this.animate);
        
        // Get delta time
        const delta = this.clock.getDelta();
        
        // Update player movement
        if (this.player) {
            this.player.updateMovement(delta);
        }
        
        // Render the scene
        this.renderer.render();
    }
}
