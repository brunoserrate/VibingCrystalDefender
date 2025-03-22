/**
 * Enemy component
 * Handles enemy pooling, spawning, and movement
 */

import { settings } from '../config/settings.js';
import { debugLog } from '../utils/helpers.js';

export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
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
                health: settings.enemies.health
            };
            
            // Initially hide the enemy
            enemy.visible = false;
            
            // Add to scene and pool
            this.scene.add(enemy);
            this.enemyPool.push(enemy);
        }
        
        debugLog(`Enemy pool created with ${poolSize} enemies`);
    }
    
    spawnEnemy(spawnPoint) {
        // Get an inactive enemy from the pool
        const enemy = this.getInactiveEnemy();
        
        if (!enemy) {
            debugLog("No inactive enemies available in the pool");
            return null;
        }
        
        // Position the enemy at the chosen spawn point
        const position = this.spawnPoints[spawnPoint];
        enemy.position.set(position.x, position.y, position.z);
        
        // Activate the enemy
        enemy.userData.isActive = true;
        enemy.visible = true;
        
        // Add to active enemies list
        this.activeEnemies.push(enemy);
        
        debugLog(`Enemy spawned at ${spawnPoint} (${position.x}, ${position.y}, ${position.z})`);
        return enemy;
    }
    
    getInactiveEnemy() {
        // Find an inactive enemy in the pool
        return this.enemyPool.find(enemy => !enemy.userData.isActive);
    }
    
    deactivateEnemy(enemy) {
        // Reset enemy state to inactive
        enemy.userData.isActive = false;
        enemy.visible = false;
        
        // Remove from active enemies list
        const index = this.activeEnemies.indexOf(enemy);
        if (index !== -1) {
            this.activeEnemies.splice(index, 1);
        }
    }
    
    updateEnemies(delta) {
        // Move all active enemies toward the crystal (center position)
        const crystalPosition = new THREE.Vector3(0, 2, 0);
        
        this.activeEnemies.forEach(enemy => {
            // Calculate direction vector to the crystal
            const direction = new THREE.Vector3();
            direction.subVectors(crystalPosition, enemy.position).normalize();
            
            // Move enemy in that direction
            const speed = enemy.userData.speed * delta;
            enemy.position.add(direction.multiplyScalar(speed));
        });
    }
    
    spawnRandomEnemy() {
        // Get a random spawn point
        const spawnPoints = Object.keys(this.spawnPoints);
        const randomSpawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        
        // Spawn an enemy at that point
        return this.spawnEnemy(randomSpawnPoint);
    }
}
