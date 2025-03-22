/**
 * Player component
 * Handles player movement, controls, and character class specifics
 */

import { settings } from '../config/settings.js';
import { detectMobileDevice, debugLog } from '../utils/helpers.js';
import { languageManager } from './language.js';

export class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.controls = null;
        
        // Player state
        this.playerClass = null;
        this.velocity = new THREE.Vector3();
        
        // Movement flags
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        // Attack properties
        this.canAttack = true;
        this.attackCooldown = 1000; // 1 second default cooldown
        this.lastAttackTime = 0;
        this.attackDirection = new THREE.Vector3();
        this.projectileManager = null; // Will be set from game.js
        
        // Mobile properties
        this.isMobile = false;
        this.forceMobile = false;
        this.leftJoystick = null;
        this.rightJoystick = null;
        this.leftJoystickManager = null;
        this.rightJoystickManager = null;
        this.joystickMovement = { x: 0, y: 0 };
        this.cameraRotation = { x: 0, y: 0 };
        
        // Debug info
        this.debugMode = true;
        this.errorLogEnabled = true;
        this.errorLog = [];
        this.maxErrorLogSize = 10;
        this.debugInfo = {
            deviceType: "",
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            leftJoystickActive: false,
            rightJoystickActive: false,
            leftJoystickValues: { x: 0, y: 0, angle: 0, force: 0 },
            rightJoystickValues: { x: 0, y: 0, angle: 0, force: 0 }
        };
        
        this.checkMobileMode();
    }
    
    initialize() {
        this.setupControls();
        this.setupEventListeners();
        
        if (this.isMobile) {
            this.setupMobileControls();
            this.showMobileUI(true);
        } else {
            this.showMobileUI(false);
        }
        
        this.debugInfo.deviceType = this.isMobile ? "Mobile" : "Desktop";
        
        return this.controls;
    }
    
    setPlayerClass(className) {
        this.playerClass = className;
        console.log(`Player class set to: ${className}`);
        
        // Apply class-specific properties here
        switch (className) {
            case 'Warrior':
            case 'Guerreiro':
                // Warrior properties (high strength, lower speed)
                this.attackCooldown = 1200; // Slower but powerful melee attack
                console.log("Warrior class properties applied");
                break;
            case 'Archer':
            case 'Arqueiro':
                // Archer properties (high range, higher speed)
                this.attackCooldown = 800; // Fast arrows
                console.log("Archer class properties applied");
                break;
            case 'Mage':
            case 'Mago':
                // Mage properties (high magic power)
                this.attackCooldown = 1500; // Slow but powerful magic attacks
                console.log("Mage class properties applied");
                break;
            default:
                console.warn(`Unknown player class: ${className}`);
        }
    }
    
    // Method to set the projectile manager reference
    setProjectileManager(projectileManager) {
        this.projectileManager = projectileManager;
        console.log("ProjectileManager set in Player class");
    }
    
    // Method to get a callback for getting active enemies
    setActiveEnemiesCallback(callback) {
        this.getActiveEnemies = callback;
    }
    
    // Default implementation of getActiveEnemies
    getActiveEnemies() {
        // This will be replaced by a callback from game.js
        console.log("getActiveEnemies called - should be implemented by game.js");
        return [];
    }
    
    setupControls() {
        // Create PointerLockControls
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        
        // Add to scene
        this.scene.add(this.controls.getObject());
        console.log("Player controls initialized");
    }
    
    setupEventListeners() {
        // Click event to request pointer lock
        document.getElementById('game-container').addEventListener('click', () => {
            if (!this.isMobile) {
                this.controls.lock();
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Mouse click for attacks (desktop)
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        
        // Touch attack button event (mobile)
        const attackButton = document.getElementById('attack-button');
        if (attackButton) {
            attackButton.addEventListener('touchstart', this.onAttackButtonPressed.bind(this));
        }
        
        // Language change event
        document.addEventListener('languageChanged', () => {
            if (this.playerClass) {
                // Convert class name based on the new language
                this.playerClass = languageManager.getClassNameTranslation(
                    this.playerClass, 
                    languageManager.currentLanguage
                );
                console.log(`Updated player class to: ${this.playerClass}`);
            }
        });
        
        // Window resize event - check if mobile mode changed
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.checkMobileMode();
            
            // If mobile state changed, update controls
            if (wasMobile !== this.isMobile) {
                if (this.isMobile) {
                    this.setupMobileControls();
                    this.showMobileUI(true);
                } else {
                    this.destroyMobileControls();
                    this.showMobileUI(false);
                }
            }
        });
    }
    
    onKeyDown(event) {
        // Skip if controlls are not locked
        if (!this.controls.isLocked) return;
        
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = true;
                break;
            case 'Space':
                this.attack();
                break;
        }
    }
    
    onKeyUp(event) {
        // Skip if controlls are not locked
        if (!this.controls.isLocked) return;
        
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    }
    
    // Mouse click handler for attacks
    onMouseDown(event) {
        // Only left mouse button (0) triggers attack
        if (event.button === 0 && this.controls.isLocked) {
            this.attack();
        }
    }
    
    // Mobile attack button handler
    onAttackButtonPressed(event) {
        event.preventDefault();
        if (this.isMobile) {
            this.attack();
        }
    }
    
    // Player attack method
    attack() {
        const currentTime = Date.now();
        
        // Check if attack is off cooldown
        if (!this.canAttack || currentTime - this.lastAttackTime < this.attackCooldown) {
            return;
        }
        
        // Set cooldown
        this.canAttack = false;
        this.lastAttackTime = currentTime;
        
        // Get camera direction for projectile
        this.camera.getWorldDirection(this.attackDirection);
        
        // Get camera position
        const position = this.controls.getObject().position.clone();
        // Adjust position to be slightly in front of camera (and at eye level)
        position.add(this.attackDirection.clone().multiplyScalar(1.0));
        
        // Execute attack based on player class
        if (this.projectileManager) {
            let attackResult = null;
            
            switch (this.playerClass) {
                case 'Warrior':
                case 'Guerreiro':
                    // Melee attack - radius check in front of player
                    attackResult = this.projectileManager.meleeAttack(
                        position, 
                        this.attackDirection, 
                        3.0, // 3 unit radius for melee attack
                        this.getActiveEnemies()
                    );
                    console.log(`Warrior melee attack hit ${attackResult} enemies`);
                    break;
                
                case 'Archer':
                case 'Arqueiro':
                    // Ranged attack - fire arrow projectile
                    attackResult = this.projectileManager.fireProjectile(
                        position,
                        this.attackDirection,
                        'arrow'
                    );
                    console.log("Archer fired arrow");
                    break;
                
                case 'Mage':
                case 'Mago':
                    // Magic attack - fire magic projectile
                    attackResult = this.projectileManager.fireProjectile(
                        position,
                        this.attackDirection,
                        'magic'
                    );
                    console.log("Mage fired magic projectile");
                    break;
            }
        } else {
            console.warn("Projectile manager not initialized");
        }
        
        // Reset attack cooldown after delay
        setTimeout(() => {
            this.canAttack = true;
        }, this.attackCooldown);
    }
    
    // Method to get active enemies (to be set from game.js)
    setActiveEnemiesGetter(callback) {
        this.getActiveEnemies = callback;
    }
    
    checkMobileMode() {
        // Detect if the device is mobile or use force flag for testing
        this.isMobile = this.forceMobile || detectMobileDevice();
        console.log(`Device detected as: ${this.isMobile ? 'Mobile' : 'Desktop'}`);
    }
    
    showMobileUI(show) {
        // Update mobile UI elements visibility
        const touchInstructions = document.getElementById('touch-instructions');
        const leftJoystick = document.getElementById('joystick-left');
        const rightJoystick = document.getElementById('joystick-right');
        const attackButton = document.getElementById('attack-button');
        
        if (touchInstructions) {
            touchInstructions.style.display = show ? 'block' : 'none';
        }
        
        if (leftJoystick) {
            leftJoystick.style.display = show ? 'block' : 'none';
        }
        
        if (rightJoystick) {
            rightJoystick.style.display = show ? 'block' : 'none';
        }
        
        if (attackButton) {
            attackButton.style.display = show ? 'block' : 'none';
        }
    }
    
    setupMobileControls() {
        // Destroy any existing joysticks first
        this.destroyMobileControls();
        
        // Setup left joystick for movement
        const leftJoystickContainer = document.getElementById('joystick-left');
        if (leftJoystickContainer) {
            this.leftJoystickManager = nipplejs.create({
                zone: leftJoystickContainer,
                mode: 'static',
                position: { left: '50%', top: '50%' },
                color: 'white',
                size: 120
            });
            
            // Listen for joystick events
            this.leftJoystickManager.on('move', (event, data) => {
                const force = Math.min(data.force, 1); // Cap force at 1
                const angle = data.angle.radian;
                
                // Convert polar to cartesian coords for easier movement calculations
                this.joystickMovement.x = Math.cos(angle) * force;
                this.joystickMovement.y = Math.sin(angle) * force;
                
                // Update debug info
                this.debugInfo.leftJoystickActive = true;
                this.debugInfo.leftJoystickValues = {
                    x: this.joystickMovement.x.toFixed(2),
                    y: this.joystickMovement.y.toFixed(2),
                    angle: angle.toFixed(2),
                    force: force.toFixed(2)
                };
            });
            
            this.leftJoystickManager.on('end', () => {
                // Reset movement when joystick is released
                this.joystickMovement.x = 0;
                this.joystickMovement.y = 0;
                
                // Update debug info
                this.debugInfo.leftJoystickActive = false;
            });
            
            console.log("Left joystick for movement initialized");
        }
        
        // Setup right joystick for camera rotation
        const rightJoystickContainer = document.getElementById('joystick-right');
        if (rightJoystickContainer) {
            this.rightJoystickManager = nipplejs.create({
                zone: rightJoystickContainer,
                mode: 'static',
                position: { left: '50%', top: '50%' },
                color: 'white',
                size: 120
            });
            
            // Listen for joystick events
            this.rightJoystickManager.on('move', (event, data) => {
                const force = Math.min(data.force, 1); // Cap force at 1
                const angle = data.angle.radian;
                
                // Apply rotation based on joystick position
                // Horizontal movement (left/right) rotates camera around Y axis
                // Vertical movement (up/down) rotates camera around X axis
                const rotX = Math.sin(angle) * force * settings.player.mobileLookSensitivity;
                const rotY = Math.cos(angle) * force * settings.player.mobileLookSensitivity;
                
                // Store rotation values to apply in updateMovement
                this.cameraRotation.x = -rotX; // Invert Y axis for natural control
                this.cameraRotation.y = rotY;
                
                // Update debug info
                this.debugInfo.rightJoystickActive = true;
                this.debugInfo.rightJoystickValues = {
                    x: rotY.toFixed(2),
                    y: rotX.toFixed(2),
                    angle: angle.toFixed(2),
                    force: force.toFixed(2)
                };
            });
            
            this.rightJoystickManager.on('end', () => {
                // Reset rotation when joystick is released
                this.cameraRotation.x = 0;
                this.cameraRotation.y = 0;
                
                // Update debug info
                this.debugInfo.rightJoystickActive = false;
            });
            
            console.log("Right joystick for camera rotation initialized");
        }
        
        // Setup attack button
        const attackButton = document.getElementById('attack-button');
        if (attackButton) {
            // Remove any existing event listeners
            attackButton.removeEventListener('touchstart', this.onAttackButtonPressed.bind(this));
            
            // Add new event listener
            attackButton.addEventListener('touchstart', this.onAttackButtonPressed.bind(this));
            console.log("Mobile attack button initialized");
        }
    }
    
    destroyMobileControls() {
        // Destroy left joystick if it exists
        if (this.leftJoystickManager) {
            this.leftJoystickManager.destroy();
            this.leftJoystickManager = null;
        }
        
        // Destroy right joystick if it exists
        if (this.rightJoystickManager) {
            this.rightJoystickManager.destroy();
            this.rightJoystickManager = null;
        }
        
        // Reset movement and rotation
        this.joystickMovement = { x: 0, y: 0 };
        this.cameraRotation = { x: 0, y: 0 };
    }
    
    updateMovement(delta) {
        const speed = settings.player.speed;
        const boundary = settings.arena.boundary;
        
        // Reset velocity
        this.velocity.x = 0;
        this.velocity.z = 0;
        
        if (this.isMobile) {
            // Mobile controls - Use joystick for movement
            if (Math.abs(this.joystickMovement.x) > settings.player.joystickDeadZone || 
                Math.abs(this.joystickMovement.y) > settings.player.joystickDeadZone) {
                
                // Get the camera's direction
                const cameraDirection = new THREE.Vector3();
                this.camera.getWorldDirection(cameraDirection);
                cameraDirection.y = 0; // Keep movement on the xz plane
                cameraDirection.normalize();
                
                // Get the right vector perpendicular to the camera direction
                const right = new THREE.Vector3();
                right.crossVectors(this.camera.up, cameraDirection).normalize();
                
                // Apply joystick movement relative to camera orientation
                this.velocity.addScaledVector(right, this.joystickMovement.x * settings.player.mobileSpeed);
                this.velocity.addScaledVector(cameraDirection, this.joystickMovement.y * settings.player.mobileSpeed);
            }
            
            // Apply camera rotation from right joystick
            if (this.cameraRotation.x !== 0 || this.cameraRotation.y !== 0) {
                // Create rotation quaternions for X and Y axes
                const rotationX = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(1, 0, 0), 
                    this.cameraRotation.x
                );
                
                const rotationY = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0), 
                    this.cameraRotation.y
                );
                
                // Apply rotations to camera
                this.camera.quaternion.multiply(rotationY);
                this.camera.quaternion.multiply(rotationX);
            }
        } else {
            // Desktop controls - Use WASD for movement
            const direction = new THREE.Vector3();
            
            // Determine movement direction from key states
            if (this.moveForward) direction.z = -1;
            if (this.moveBackward) direction.z = 1;
            if (this.moveLeft) direction.x = -1;
            if (this.moveRight) direction.x = 1;
            
            // Normalize for consistent speed in all directions
            if (direction.length() > 0) {
                direction.normalize();
            }
            
            // Apply movement based on camera orientation
            if (direction.x !== 0) {
                this.velocity.x = direction.x * speed;
            }
            if (direction.z !== 0) {
                this.velocity.z = direction.z * speed;
            }
        }
        
        // Get current position
        const position = this.controls.getObject().position;
        
        // Calculate new position
        const newX = position.x + this.velocity.x;
        const newZ = position.z + this.velocity.z;
        
        // Apply arena boundaries
        if (newX > -boundary && newX < boundary) {
            position.x = newX;
        }
        if (newZ > -boundary && newZ < boundary) {
            position.z = newZ;
        }
    }
}
