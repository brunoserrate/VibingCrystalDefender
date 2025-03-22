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

        // Wave system
        this.currentWave = 0;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesKilledThisWave = 0;
        this.totalEnemiesInWave = 0;
        this.isWaveInProgress = false;
        this.nextWaveTime = 0;
        this.waveStartTime = 0;

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
                // Count enemy defeated for wave system
                this.handleEnemyDefeated();
            }
        };

        // Connect the enemy manager with the player for targeting
        this.player.setActiveEnemiesCallback(() => {
            return this.enemyManager ? this.enemyManager.getActiveEnemies() : [];
        });

        // Setup game over callback
        this.renderer.onGameOver = () => this.handleGameOver();

        // Create basic UI for crystal health and wave system
        this.createGameUI();

        // Set player class
        if (this.playerClass) {
            this.player.setPlayerClass(this.playerClass);
        }

        // Reset the clock for accurate timing
        this.clock.start();
        this.currentGameTime = 0;

        // Start the game loop
        this.isGameRunning = true;
        this.isGameOver = false;

        // Initialize wave settings
        this.currentWave = 0;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesKilledThisWave = 0;
        this.totalEnemiesInWave = 0;
        this.isWaveInProgress = false;
        this.nextWaveTime = this.clock.getElapsedTime() + settings.waves.initialDelay;

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

        // Create wave UI
        this.createWaveUI();
    }

    createWaveUI() {
        // Create wave display container
        const waveContainer = document.createElement('div');
        waveContainer.id = 'wave-container';
        waveContainer.style.position = 'absolute';
        waveContainer.style.top = '10px';
        waveContainer.style.right = '10px';
        waveContainer.style.color = 'white';
        waveContainer.style.textShadow = '1px 1px 2px black';
        waveContainer.style.fontFamily = 'Arial, sans-serif';
        waveContainer.style.fontSize = '18px';
        waveContainer.style.textAlign = 'right';
        waveContainer.style.padding = '10px';
        waveContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        waveContainer.style.borderRadius = '5px';

        // Create wave number display
        const waveNumber = document.createElement('div');
        waveNumber.id = 'wave-number';
        waveNumber.textContent = `${languageManager.get('gameplay.waves.current')}: 0`;
        waveNumber.style.marginBottom = '5px';

        // Create enemies counter
        const enemiesCounter = document.createElement('div');
        enemiesCounter.id = 'enemies-counter';
        enemiesCounter.textContent = `${languageManager.get('gameplay.enemies.defeated')}: 0 / 0`;
        enemiesCounter.style.marginBottom = '5px';

        // Create next wave countdown
        const nextWaveCountdown = document.createElement('div');
        nextWaveCountdown.id = 'next-wave-countdown';
        nextWaveCountdown.style.color = '#ffcc00';

        // Add elements to container
        waveContainer.appendChild(waveNumber);
        waveContainer.appendChild(enemiesCounter);
        waveContainer.appendChild(nextWaveCountdown);

        // Add to the DOM
        document.body.appendChild(waveContainer);
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

    handleEnemyDefeated() {
        if (this.isWaveInProgress) {
            this.enemiesKilledThisWave++;
            this.updateWaveUI();

            // Check if the wave is complete
            if (this.enemiesKilledThisWave >= this.totalEnemiesInWave) {
                this.completeWave();
            }
        }
    }

    spawnNextWave() {
        this.currentWave++;

        // Calculate enemies for this wave
        this.totalEnemiesInWave = settings.waves.enemiesFirstWave +
            (this.currentWave - 1) * settings.waves.enemyIncreasePerWave;

        // Reset counters
        this.enemiesSpawnedThisWave = 0;
        this.enemiesKilledThisWave = 0;

        // Start wave
        this.isWaveInProgress = true;
        this.waveStartTime = this.clock.getElapsedTime();

        debugLog(`Wave ${this.currentWave} started with ${this.totalEnemiesInWave} enemies`, null, false, { enabled: true });

        // Update UI
        this.updateWaveUI();

        // Spawn initial batch of enemies
        this.spawnEnemiesForCurrentWave();
    }

    completeWave() {
        this.isWaveInProgress = false;
        this.nextWaveTime = this.clock.getElapsedTime() + settings.waves.delayBetweenWaves;
        debugLog(`Wave ${this.currentWave} completed. Next wave in ${settings.waves.delayBetweenWaves} seconds`, null, false, { enabled: true });
    }

    updateWaveSystem() {
        const currentTime = this.clock.getElapsedTime();

        if (!this.isWaveInProgress) {
            // Check if it's time to start the next wave
            if (currentTime >= this.nextWaveTime) {
                this.spawnNextWave();
            } else if (settings.waves.showCountdown) {
                // Update the next wave countdown
                this.updateNextWaveCountdown(currentTime);
            }
        } else {
            // Check if we need to spawn more enemies
            if (this.enemiesSpawnedThisWave < this.totalEnemiesInWave) {
                // Determine if it's time to spawn the next batch
                if (currentTime - this.lastEnemySpawnTime > settings.enemies.spawnDelay) {
                    this.spawnEnemiesForCurrentWave();
                }
            }
        }
    }

    spawnEnemiesForCurrentWave() {
        // Calculate how many enemies to spawn now
        const remainingToSpawn = this.totalEnemiesInWave - this.enemiesSpawnedThisWave;
        const spawnCount = Math.min(remainingToSpawn, settings.waves.maxEnemiesPerSpawn);

        // Spawn enemies from different directions
        const spawnDirections = ['north', 'south', 'east', 'west'];
        let enemiesSpawned = 0;

        for (let i = 0; i < spawnCount; i++) {
            // Select a direction, cycling through the available directions
            const direction = spawnDirections[i % spawnDirections.length];
            const enemy = this.enemyManager.spawnEnemyFromDirection(direction);

            if (enemy) {
                this.enemiesSpawnedThisWave++;
                enemiesSpawned++;
                debugLog(`Spawned enemy ${this.enemiesSpawnedThisWave}/${this.totalEnemiesInWave} from ${direction}`, null, false, { enabled: true });
            }
        }

        // Update last spawn time
        this.lastEnemySpawnTime = this.clock.getElapsedTime();

        // Update UI
        this.updateWaveUI();
    }

    updateWaveUI() {
        const waveNumber = document.getElementById('wave-number');
        const enemiesCounter = document.getElementById('enemies-counter');

        if (waveNumber) {
            waveNumber.textContent = `${languageManager.get('gameplay.waves.current')}: ${this.currentWave}`;
        }

        if (enemiesCounter) {
            enemiesCounter.textContent = `${languageManager.get('gameplay.enemies.defeated')}: ${this.enemiesKilledThisWave} / ${this.totalEnemiesInWave}`;
        }
    }

    updateNextWaveCountdown(currentTime) {
        const nextWaveCountdown = document.getElementById('next-wave-countdown');

        if (nextWaveCountdown) {
            const timeRemaining = Math.ceil(this.nextWaveTime - currentTime);

            if (timeRemaining > 0) {
                nextWaveCountdown.textContent = `${languageManager.get('gameplay.waves.next')}: ${timeRemaining} ${languageManager.get('gameplay.waves.seconds')}`;
            } else {
                nextWaveCountdown.textContent = '';
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

        // Update wave system
        this.updateWaveSystem();

        // Update enemies
        if (this.enemyManager) {
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
