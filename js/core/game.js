/**
 * Main Game Manager
 * Central controller for the Vibing Crystal Defender game
 */

import { settings } from '../config/settings.js';
import { Renderer } from './renderer.js';
import { Player } from './player.js';
import { EnemyManager } from './enemy.js';
import { ProjectileManager } from './projectile.js';
import { languageManager } from './language.js';
import { debugLog } from '../utils/helpers.js';

export class VibingCrystalDefender {
    constructor() {
        // Game state
        this.isGameRunning = false;
        this.isGameOver = false;
        
        // Components
        this.renderer = new Renderer();
        this.player = null;
        this.enemyManager = null;
        this.projectileManager = null;
        
        // Animation
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        
        // Debug mode
        this.debugMode = true;
        
        // Character selection
        this.playerClass = null;
        
        // Enemy spawning timer
        this.lastEnemySpawnTime = 0;
        
        // Current game time
        this.currentGameTime = 0;
        
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
        
        // Get the crystal from the renderer
        const crystal = this.renderer.getCrystal();
        
        // Initialize projectile manager
        this.projectileManager = new ProjectileManager(scene);
        
        // Initialize player with scene components and projectile manager
        this.player = new Player(camera, scene);
        this.player.initialize();
        this.player.setProjectileManager(this.projectileManager);
        
        // Initialize enemy manager with crystal reference
        this.enemyManager = new EnemyManager(scene, crystal);
        
        // Setup enemy defeated callback for projectiles
        this.projectileManager.onEnemyDefeated = (enemy) => {
            if (this.enemyManager && typeof this.enemyManager.deactivateEnemy === 'function') {
                this.enemyManager.deactivateEnemy(enemy);
            }
        };
        
        // Connect the enemy manager with the player for targeting
        this.player.setActiveEnemiesCallback(() => {
            return this.enemyManager ? this.enemyManager.getActiveEnemies() : [];
        });
        
        // Setup game over callback
        this.renderer.onGameOver = () => this.handleGameOver();
        
        // Create basic UI for crystal health
        this.createGameUI();
        
        // Set player class
        if (this.playerClass) {
            this.player.setPlayerClass(this.playerClass);
        }
        
        // Reset the clock for accurate timing
        this.clock.start();
        this.lastEnemySpawnTime = 0;
        this.currentGameTime = 0;
        
        // Start the game loop
        this.isGameRunning = true;
        this.isGameOver = false;
        requestAnimationFrame(this.animate);
        
        console.log("Game initialized successfully");
    }
    
    createGameUI() {
        // Create a UI container
        const uiContainer = document.createElement('div');
        uiContainer.id = 'game-ui';
        uiContainer.style.position = 'absolute';
        uiContainer.style.top = '50px';  
        uiContainer.style.left = '10px';
        uiContainer.style.color = 'white';
        uiContainer.style.textShadow = '1px 1px 2px black';
        uiContainer.style.fontFamily = 'Arial, sans-serif';
        uiContainer.style.fontSize = '18px';
        
        // Create crystal health display
        const crystalHealthContainer = document.createElement('div');
        crystalHealthContainer.style.marginBottom = '10px';
        crystalHealthContainer.style.display = 'flex';
        crystalHealthContainer.style.alignItems = 'center';
        
        // Create crystal health label
        const crystalHealthLabel = document.createElement('div');
        crystalHealthLabel.textContent = languageManager.get('ui.crystal_health') + ': ';
        crystalHealthLabel.style.marginRight = '10px';
        
        // Create health bar background
        const healthBarBackground = document.createElement('div');
        healthBarBackground.style.width = '150px';
        healthBarBackground.style.height = '15px';
        healthBarBackground.style.backgroundColor = '#333';
        healthBarBackground.style.border = '1px solid #666';
        healthBarBackground.style.borderRadius = '3px';
        healthBarBackground.style.overflow = 'hidden';
        
        // Create health bar
        const healthBar = document.createElement('div');
        healthBar.id = 'crystal-health-bar';
        healthBar.style.width = '100%';
        healthBar.style.height = '100%';
        healthBar.style.backgroundColor = '#3498db';
        healthBar.style.transition = 'width 0.3s';
        
        // Create health percentage
        const healthPercentage = document.createElement('div');
        healthPercentage.id = 'crystal-health';
        healthPercentage.textContent = '100%';
        healthPercentage.style.marginLeft = '10px';
        
        // Assemble health bar
        healthBarBackground.appendChild(healthBar);
        crystalHealthContainer.appendChild(crystalHealthLabel);
        crystalHealthContainer.appendChild(healthBarBackground);
        crystalHealthContainer.appendChild(healthPercentage);
        
        // Add to UI container
        uiContainer.appendChild(crystalHealthContainer);
        
        // Add UI container to the DOM
        document.body.appendChild(uiContainer);
    }
    
    handleGameOver() {
        if (this.isGameOver) return; // Prevent multiple calls
        
        this.isGameOver = true;
        debugLog("Game over - The crystal has been destroyed!");
        
        // Create game over screen
        const gameOverScreen = document.createElement('div');
        gameOverScreen.id = 'game-over-screen';
        gameOverScreen.style.position = 'absolute';
        gameOverScreen.style.top = '0';
        gameOverScreen.style.left = '0';
        gameOverScreen.style.width = '100%';
        gameOverScreen.style.height = '100%';
        gameOverScreen.style.backgroundColor = 'rgba(0,0,0,0.7)';
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.flexDirection = 'column';
        gameOverScreen.style.justifyContent = 'center';
        gameOverScreen.style.alignItems = 'center';
        gameOverScreen.style.color = 'white';
        gameOverScreen.style.fontFamily = 'Arial, sans-serif';
        gameOverScreen.style.zIndex = '1000';
        
        // Game over title
        const gameOverTitle = document.createElement('h1');
        gameOverTitle.textContent = languageManager.get('ui.game_over');
        gameOverTitle.style.fontSize = '48px';
        gameOverTitle.style.marginBottom = '20px';
        
        // Game over message
        const gameOverMessage = document.createElement('p');
        gameOverMessage.textContent = languageManager.get('ui.crystal_destroyed');
        gameOverMessage.style.fontSize = '24px';
        gameOverMessage.style.marginBottom = '40px';
        
        // Restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = languageManager.get('ui.restart');
        restartButton.style.padding = '10px 20px';
        restartButton.style.fontSize = '20px';
        restartButton.style.cursor = 'pointer';
        restartButton.style.backgroundColor = '#3498db';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.color = 'white';
        restartButton.onclick = () => {
            location.reload(); // Simple reload to restart the game
        };
        
        // Assemble game over screen
        gameOverScreen.appendChild(gameOverTitle);
        gameOverScreen.appendChild(gameOverMessage);
        gameOverScreen.appendChild(restartButton);
        
        // Add to the DOM
        document.body.appendChild(gameOverScreen);
        
        // Stop the game loop
        this.isGameRunning = false;
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
        
        // Update current game time (in milliseconds for timing accuracy)
        this.currentGameTime = Date.now();
        
        // Update player movement
        if (this.player) {
            this.player.updateMovement(delta);
        }
        
        // Spawn and update enemies
        if (this.enemyManager) {
            this.spawnEnemiesIfNeeded();
            this.enemyManager.updateEnemies(delta, this.currentGameTime);
        }
        
        // Update projectiles
        if (this.projectileManager && this.enemyManager) {
            this.projectileManager.update(delta, this.currentGameTime, this.enemyManager.getActiveEnemies());
        }
        
        // Render the scene
        this.renderer.render(this.currentGameTime);
    }
}
