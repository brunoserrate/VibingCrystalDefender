/**
 * Projectile Manager
 * Handles creation, movement, and collision detection for player projectiles
 */

import { settings } from '../config/settings.js';

export class ProjectileManager {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];
        this.projectilePool = [];
        this.poolSize = 20; // Maximum number of projectiles at once

        // Initialize the projectile pool
        this.initializeProjectilePool();
    }

    initializeProjectilePool() {
        // Create archer projectiles (arrows)
        for (let i = 0; i < this.poolSize; i++) {
            // Create a small sphere for arrow projectile
            const arrowGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // Gold color for arrows
            const arrowProjectile = new THREE.Mesh(arrowGeometry, arrowMaterial);

            // Set initial properties
            arrowProjectile.visible = false;
            arrowProjectile.userData = {
                type: 'arrow',
                active: false,
                velocity: new THREE.Vector3(),
                speed: 3.5,
                damage: 20,
                lifeTime: 3000, // milliseconds
                spawnTime: 0
            };

            // Add to scene and pool
            this.scene.add(arrowProjectile);
            this.projectilePool.push(arrowProjectile);

            // Create a small sphere for magic projectile
            const magicGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const magicMaterial = new THREE.MeshBasicMaterial({ color: 0x9966ff }); // Purple color for magic
            const magicProjectile = new THREE.Mesh(magicGeometry, magicMaterial);

            // Set initial properties
            magicProjectile.visible = false;
            magicProjectile.userData = {
                type: 'magic',
                active: false,
                velocity: new THREE.Vector3(),
                speed: 2.5,
                damage: 30,
                lifeTime: 3500, // milliseconds
                spawnTime: 0
            };

            // Add to scene and pool
            this.scene.add(magicProjectile);
            this.projectilePool.push(magicProjectile);
        }

        console.log(`Initialized projectile pool with ${this.projectilePool.length} projectiles`);
    }

    fireProjectile(position, direction, type) {
        // Get inactive projectile of the specified type
        const projectile = this.getInactiveProjectile(type);
        if (!projectile) {
            console.warn(`No inactive ${type} projectiles available`);
            return null;
        }

        // Set position and make visible
        projectile.position.copy(position);

        // Set direction and velocity
        projectile.userData.velocity.copy(direction).normalize().multiplyScalar(projectile.userData.speed);
        projectile.userData.active = true;
        projectile.userData.spawnTime = Date.now();
        projectile.visible = true;

        // Add to active projectiles
        this.projectiles.push(projectile);

        return projectile;
    }

    getInactiveProjectile(type) {
        for (const projectile of this.projectilePool) {
            if (!projectile.userData.active && projectile.userData.type === type) {
                return projectile;
            }
        }
        return null;
    }

    deactivateProjectile(projectile) {
        projectile.visible = false;
        projectile.userData.active = false;

        // Remove from active projectiles array
        const index = this.projectiles.indexOf(projectile);
        if (index !== -1) {
            this.projectiles.splice(index, 1);
        }
    }

    update(delta, currentTime, enemies) {
        // Update projectile positions and check for collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            // Move projectile
            projectile.position.x += projectile.userData.velocity.x * delta;
            projectile.position.y += projectile.userData.velocity.y * delta;
            projectile.position.z += projectile.userData.velocity.z * delta;

            // Check if projectile is out of bounds
            if (Math.abs(projectile.position.x) > settings.arena.boundary ||
                Math.abs(projectile.position.z) > settings.arena.boundary ||
                currentTime - projectile.userData.spawnTime > projectile.userData.lifeTime) {
                this.deactivateProjectile(projectile);
                continue;
            }

            // Check for collisions with enemies
            for (const enemy of enemies) {
                if (enemy.userData.isActive) {
                    const distance = projectile.position.distanceTo(enemy.position);

                    // If collision detected
                    if (distance < 1.0) { // Assuming enemy size is around 1 unit
                        // Enemy takes damage
                        enemy.userData.health -= projectile.userData.damage;

                        // If enemy health <= 0, deactivate it
                        if (enemy.userData.health <= 0) {
                            enemy.userData.isActive = false;
                            enemy.visible = false;

                            // If enemy manager has a deactivateEnemy method, call it
                            if (typeof this.onEnemyDefeated === 'function') {
                                this.onEnemyDefeated(enemy);
                            }
                        }

                        // Deactivate projectile
                        this.deactivateProjectile(projectile);
                        break;
                    }
                }
            }
        }
    }

    // Method to handle warrior's melee attack (radius check)
    meleeAttack(position, direction, radius, enemies) {
        let hitCount = 0;

        // Project the attack position forward
        const attackPosition = new THREE.Vector3()
            .copy(position)
            .add(direction.clone().multiplyScalar(2)); // Attack range is in front of player

        // Check for enemies within attack radius
        for (const enemy of enemies) {
            if (enemy.userData.isActive) {
                const distance = attackPosition.distanceTo(enemy.position);

                // If enemy within melee range
                if (distance < radius) {
                    // Enemy takes damage
                    enemy.userData.health -= 40; // Melee deals more damage

                    // If enemy health <= 0, deactivate it
                    if (enemy.userData.health <= 0) {
                        enemy.userData.isActive = false;
                        enemy.visible = false;

                        // If enemy manager has a deactivateEnemy method, call it
                        if (typeof this.onEnemyDefeated === 'function') {
                            this.onEnemyDefeated(enemy);
                        }
                    }

                    hitCount++;
                }
            }
        }

        return hitCount;
    }

    // Set callback for when an enemy is defeated
    setEnemyDefeatedCallback(callback) {
        this.onEnemyDefeated = callback;
    }
}
