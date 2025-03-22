/**
 * Main Game Manager
 * Central controller for the Vibing Crystal Defender game
 */

import { settings } from '../config/settings.js';
import { Renderer } from './renderer.js';
import { Player } from './player.js';
import { EnemyManager } from './enemy.js';
import { languageManager } from './language.js';
import { debugLog } from '../utils/helpers.js';

export class VibingCrystalDefender {
    constructor() {
        // Game state
        this.isGameRunning = false;
        
        // Components
        this.renderer = new Renderer();
        this.player = null;
        this.enemyManager = null;
        
        // Animation
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        
        // Debug mode
        this.debugMode = true;
        
        // Character selection
        this.playerClass = null;
        
        // Enemy spawning timer
        this.lastEnemySpawnTime = 0;
        
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
        
        // Initialize enemy manager
        this.enemyManager = new EnemyManager(scene);
        
        // Set player class
        if (this.playerClass) {
            this.player.setPlayerClass(this.playerClass);
        }
        
        // Reset the clock for accurate timing
        this.clock.start();
        this.lastEnemySpawnTime = 0;
        
        // Start the game loop
        this.isGameRunning = true;
        requestAnimationFrame(this.animate);
        
        console.log("Game initialized successfully");
    }
    
    spawnEnemiesIfNeeded() {
        // Check if it's time to spawn a new enemy based on spawn delay setting
        const currentTime = this.clock.getElapsedTime();
        
        if (currentTime - this.lastEnemySpawnTime > settings.enemies.spawnDelay) {
            // Spawn a random enemy
            const enemy = this.enemyManager.spawnRandomEnemy();
            
            if (enemy) {
                this.lastEnemySpawnTime = currentTime;
                debugLog(`Enemy spawned at ${currentTime.toFixed(2)}s`);
            }
        }
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
        
        // Spawn and update enemies
        if (this.enemyManager) {
            this.spawnEnemiesIfNeeded();
            this.enemyManager.updateEnemies(delta);
        }
        
        // Render the scene
        this.renderer.render();
    }
}
