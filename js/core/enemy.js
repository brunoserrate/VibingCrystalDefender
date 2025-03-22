/**
 * Enemy component
 * Handles enemy pooling, spawning, movement and crystal attack
 */

import { settings } from '../config/settings.js';
import { debugLog } from '../utils/helpers.js';

export class EnemyManager {
    constructor(scene, crystal) {
        this.scene = scene;
        this.crystal = crystal;
        this.enemyPool = [];
        this.activeEnemies = [];
        this.spawnPoints = {
            north: { x: 0, y: 1, z: -50 },
            south: { x: 0, y: 1, z: 50 },
            east: { x: 50, y: 1, z: 0 },
            west: { x: -50, y: 1, z: 0 }
        };

        // UI elements for enemy health bars
        this.healthBars = {};
        this.uiContainer = null;
        this.camera = null;

        // Initialize enemy pool
        this.initializeEnemyPool();

        // Create UI container for enemy health bars
        this.createUIContainer();
    }

    // Set camera reference for 3D to 2D projection
    setCamera(camera) {
        this.camera = camera;
    }

    createUIContainer() {
        // Create a container for enemy health bars
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'enemy-health-bars';
        document.body.appendChild(this.uiContainer);
    }

    initializeEnemyPool() {
        // Create a pool of reusable enemy objects
        const poolSize = settings.enemies.poolSize;

        for (let i = 0; i < poolSize; i++) {
            // Create cube geometry for enemy
            const geometry = new THREE.BoxGeometry(1, 2, 1);
            const material = new THREE.MeshPhongMaterial({ color: 0xFF0000 }); // Red enemies

            // Create enemy mesh
            const enemy = new THREE.Mesh(geometry, material);

            // Initialize properties
            enemy.userData = {
                isActive: false,
                speed: settings.enemies.speed,
                health: settings.enemies.health,
                maxHealth: settings.enemies.health,
                isAttackingCrystal: false,
                lastAttackTime: 0,
                id: `enemy-${i}` // Unique ID for this enemy
            };

            // Initially hide the enemy
            enemy.visible = false;

            // Add to scene and pool
            this.scene.add(enemy);
            this.enemyPool.push(enemy);
        }

        debugLog(`Enemy pool created with ${poolSize} enemies`);
    }

    /**
     * Returns array of currently active enemies
     * Used by the player's targeting system and projectile manager
     */
    getActiveEnemies() {
        return this.activeEnemies;
    }

    spawnRandomEnemy() {
        // Get an inactive enemy from the pool
        const enemy = this.getInactiveEnemy();

        if (!enemy) {
            debugLog("No inactive enemies available in the pool");
            return null;
        }

        // Position the enemy at the chosen spawn point
        const spawnPoints = Object.keys(this.spawnPoints);
        const randomSpawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        const position = this.spawnPoints[randomSpawnPoint];
        enemy.position.set(position.x, position.y, position.z);

        // Activate the enemy
        enemy.userData.isActive = true;
        enemy.userData.isAttackingCrystal = false;
        enemy.userData.lastAttackTime = 0;
        enemy.visible = true;

        // Reset enemy health to max
        enemy.userData.health = settings.enemies.health;
        enemy.userData.maxHealth = settings.enemies.health;

        // Create health bar UI for this enemy
        this.createHealthBarForEnemy(enemy);

        // Add to active enemies list
        this.activeEnemies.push(enemy);

        debugLog(`Enemy spawned at ${randomSpawnPoint} (${position.x}, ${position.y}, ${position.z})`);
        return enemy;
    }

    /**
     * Spawn an enemy from a specific direction
     * @param {string} direction - The direction to spawn from ('north', 'south', 'east', 'west')
     * @returns {THREE.Mesh|null} - The spawned enemy or null if no enemy could be spawned
     */
    spawnEnemyFromDirection(direction) {
        // Get an inactive enemy from the pool
        const enemy = this.getInactiveEnemy();

        if (!enemy) {
            debugLog("No inactive enemies available in the pool");
            return null;
        }

        // Validate direction
        if (!this.spawnPoints[direction]) {
            direction = 'north'; // Default to north if invalid direction
        }

        // Get spawn position for the specified direction
        const position = this.spawnPoints[direction];

        // Position the enemy at the spawn point
        enemy.position.set(position.x, position.y, position.z);

        // Activate the enemy
        enemy.userData.isActive = true;
        enemy.userData.isAttackingCrystal = false;
        enemy.userData.lastAttackTime = 0;
        enemy.visible = true;

        // Reset enemy health to max
        enemy.userData.health = settings.enemies.health;
        enemy.userData.maxHealth = settings.enemies.health;

        // Create health bar UI for this enemy
        this.createHealthBarForEnemy(enemy);

        // Add to active enemies list
        this.activeEnemies.push(enemy);

        debugLog(`Enemy spawned from ${direction} (${position.x}, ${position.y}, ${position.z})`);
        return enemy;
    }

    getInactiveEnemy() {
        // Find an inactive enemy in the pool
        return this.enemyPool.find(enemy => !enemy.userData.isActive);
    }

    deactivateEnemy(enemy) {
        // Reset enemy state to inactive
        enemy.userData.isActive = false;
        enemy.userData.isAttackingCrystal = false;
        enemy.visible = false;

        // Remove health bar UI
        this.removeHealthBarForEnemy(enemy);

        // Remove from active enemies list
        const index = this.activeEnemies.indexOf(enemy);
        if (index !== -1) {
            this.activeEnemies.splice(index, 1);
        }
    }

    updateEnemies(delta, currentTime) {
        // Move all active enemies toward the crystal or have them attack if close enough
        const crystalPosition = new THREE.Vector3(
            settings.crystal.position.x,
            settings.crystal.position.y,
            settings.crystal.position.z
        );

        this.activeEnemies.forEach(enemy => {
            // Calculate distance to crystal
            const distanceToCrystal = enemy.position.distanceTo(crystalPosition);

            // Check if enemy is within attack range of crystal
            if (distanceToCrystal <= settings.enemies.attackRange) {
                // If enemy wasn't already attacking crystal, log it
                if (!enemy.userData.isAttackingCrystal) {
                    enemy.userData.isAttackingCrystal = true;
                    debugLog("Enemy reached crystal and started attacking");
                }

                // Attack the crystal once per second
                if (currentTime - enemy.userData.lastAttackTime >= 1000) {
                    this.attackCrystal(enemy);
                    enemy.userData.lastAttackTime = currentTime;
                }
            } else if (!enemy.userData.isAttackingCrystal) {
                // Only move if not attacking crystal
                // Calculate direction vector to the crystal
                const direction = new THREE.Vector3();
                direction.subVectors(crystalPosition, enemy.position).normalize();

                // Move enemy in that direction
                const speed = enemy.userData.speed * delta;
                enemy.position.add(direction.multiplyScalar(speed));
            }

            // Update health bar position for this enemy
            this.updateHealthBarPosition(enemy);
        });
    }

    attackCrystal(enemy) {
        // Deal damage to the crystal
        if (this.crystal && typeof this.crystal.takeDamage === 'function') {
            this.crystal.takeDamage(settings.enemies.attackDamage);
        }
    }

    // Project a 3D position to 2D screen coordinates
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

    createHealthBarForEnemy(enemy) {
        // Get enemy ID
        const enemyId = enemy.userData.id;

        // Create health bar container
        const healthBarContainer = document.createElement('div');
        healthBarContainer.className = 'enemy-health-container';
        healthBarContainer.id = `health-${enemyId}`;

        // Create background bar
        const healthBarBg = document.createElement('div');
        healthBarBg.className = 'enemy-health-background';

        // Create actual health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'enemy-health-bar';

        // Assemble health bar
        healthBarBg.appendChild(healthBar);
        healthBarContainer.appendChild(healthBarBg);

        // Add to the DOM
        this.uiContainer.appendChild(healthBarContainer);

        // Store reference
        this.healthBars[enemyId] = {
            container: healthBarContainer,
            bar: healthBar
        };

        // Initial position update
        this.updateHealthBarPosition(enemy);

        // Initial health update
        this.updateHealthBarValue(enemy);
    }

    removeHealthBarForEnemy(enemy) {
        const enemyId = enemy.userData.id;

        // Remove health bar from DOM if it exists
        if (this.healthBars[enemyId]) {
            this.uiContainer.removeChild(this.healthBars[enemyId].container);
            delete this.healthBars[enemyId];
        }
    }

    updateHealthBarPosition(enemy) {
        if (!this.camera) return;

        const enemyId = enemy.userData.id;
        const healthBarElements = this.healthBars[enemyId];

        if (!healthBarElements) return;

        // Get enemy position and add offset to place bar above enemy
        const position = enemy.position.clone();
        position.y += 2.0; // Reduzido de 2.5 para 2.0 para posicionar um pouco mais baixo

        // Project to screen coordinates
        const screenPosition = this.projectPositionToScreen(position);

        // Update health bar container position
        const container = healthBarElements.container;
        container.style.left = `${screenPosition.x}px`;
        container.style.top = `${screenPosition.y}px`;

        // Calculate distance to camera to adjust visibility
        const distanceToCamera = enemy.position.distanceTo(this.camera.position);

        // Only show health bar if enemy is visible and within reasonable distance
        if (enemy.visible && distanceToCamera < 50) {
            container.style.display = 'block';

            // Scale based on distance (optional)
            const scale = Math.max(0.5, Math.min(1, 1 - distanceToCamera / 50));
            container.style.transform = `translate(-50%, -50%) scale(${scale})`;
        } else {
            container.style.display = 'none';
        }
    }

    updateHealthBarValue(enemy) {
        const enemyId = enemy.userData.id;
        const healthBarElements = this.healthBars[enemyId];

        if (!healthBarElements) return;

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

    // Method to handle enemy taking damage
    enemyTakeDamage(enemy, damage) {
        enemy.userData.health -= damage;

        // Update health bar
        this.updateHealthBarValue(enemy);

        return enemy.userData.health <= 0;
    }
}
