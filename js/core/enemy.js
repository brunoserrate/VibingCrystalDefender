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
        
        // Initialize enemy pool
        this.initializeEnemyPool();
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
                isAttackingCrystal: false,
                lastAttackTime: 0
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
        
        // Reset enemy health
        enemy.userData.health = settings.enemies.health;
        
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
        });
    }
    
    attackCrystal(enemy) {
        // Deal damage to the crystal
        if (this.crystal && typeof this.crystal.takeDamage === 'function') {
            this.crystal.takeDamage(settings.enemies.attackDamage);
        }
    }
}
