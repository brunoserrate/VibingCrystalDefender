/**
 * Renderer component
 * Handles all Three.js scene setup and rendering
 */

import { settings } from '../config/settings.js';
import { handleResize, createColorMaterial, debugLog } from '../utils/helpers.js';

export class Renderer {
    constructor() {
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Floor and skybox
        this.floor = null;
        
        // Crystal
        this.crystal = null;
        this.crystalLight = null;
        this.crystalHealth = settings.crystal.health;
        this.crystalMaxHealth = settings.crystal.health;
        this.isDamageAnimationPlaying = false;
        this.damageAnimationStartTime = 0;
        this.damageAnimationDuration = 300; // milliseconds
        this.crystalOriginalColor = 0x88CCFF; // Light blue
        this.crystalDamageColor = 0xFF4444; // Red for damage feedback
        
        // Game state
        this.isGameOver = false;
        this.onGameOver = null; // Callback when game is over
    }
    
    initialize() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.createFloor();
        this.createCrystal();
        this.setupLighting();
        
        // Handle window resize
        handleResize(this.renderer, this.camera);
        
        return {
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer
        };
    }
    
    setupScene() {
        // Create scene with blue sky background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        console.log("Scene created with sky background");
    }
    
    setupCamera() {
        // Create perspective camera at eye level
        const { fov, near, far, position } = settings.camera;
        this.camera = new THREE.PerspectiveCamera(
            fov,
            window.innerWidth / window.innerHeight,
            near,
            far
        );
        this.camera.position.set(position.x, position.y, position.z);
        console.log("Camera positioned at eye level");
    }
    
    setupRenderer() {
        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: settings.renderer.antialias 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Add renderer to DOM
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        console.log("Renderer created and added to DOM");
    }
    
    createFloor() {
        // Create a 100x100 plane as the floor
        const geometry = new THREE.PlaneGeometry(100, 100);

        // Create a material with a simple texture
        const material = new THREE.MeshBasicMaterial({
            color: 0x228B22, // Forest green
            side: THREE.DoubleSide // Visible from both sides
        });

        // Create the mesh and add it to the scene
        const floor = new THREE.Mesh(geometry, material);

        // Rotate the floor to be horizontal (it's vertical by default)
        floor.rotation.x = Math.PI / 2;

        // Position at y=0
        floor.position.y = 0;

        // Add to the scene
        this.scene.add(floor);

        // Add a grid helper for better sense of scale and space
        const gridSize = 100; // Size of the grid (matches floor size)
        const gridDivisions = 20; // Number of divisions (5-meter grid cells)
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x444444);
        
        // Position the grid at ground level (y=0)
        gridHelper.position.y = 0.01; // Slightly above floor to prevent z-fighting
        
        // Add the grid to the scene
        this.scene.add(gridHelper);

        console.log("Floor and grid created and added to scene");
    }
    
    createCrystal() {
        // Create a sphere geometry for the crystal
        const geometry = new THREE.SphereGeometry(settings.crystal.radius, 32, 32);
        
        // Create a material for the crystal with slight transparency and shininess
        const material = new THREE.MeshPhongMaterial({
            color: this.crystalOriginalColor, // Light blue
            transparent: true,
            opacity: 0.8,
            shininess: 90,
            specular: 0xFFFFFF
        });
        
        // Create the crystal mesh
        this.crystal = new THREE.Mesh(geometry, material);
        
        // Position the crystal at the center of the arena
        this.crystal.position.copy(new THREE.Vector3(
            settings.crystal.position.x,
            settings.crystal.position.y,
            settings.crystal.position.z
        ));
        
        // Add health system to crystal
        this.crystal.userData = {
            health: this.crystalHealth,
            maxHealth: this.crystalMaxHealth
        };
        
        // Add the takeDamage method to the crystal
        this.crystal.takeDamage = (damage) => this.takeDamage(damage);
        
        // Add crystal to the scene
        this.scene.add(this.crystal);
        
        // Add a point light near the crystal to highlight it
        this.crystalLight = new THREE.PointLight(0xAAFFFF, 1, 10);
        this.crystalLight.position.set(0, 3, 0); // Slightly above the crystal
        this.scene.add(this.crystalLight);
        
        console.log("Crystal created with health system and positioned at the center with highlighting light");
    }
    
    setupLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light (sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50); // Position from top-right
        this.scene.add(directionalLight);
        
        console.log("Lighting setup complete");
    }
    
    takeDamage(damage) {
        // Reduce crystal health
        this.crystalHealth -= damage;
        this.crystal.userData.health = this.crystalHealth;
        
        // Update crystal health in UI if it exists
        const crystalHealthElement = document.getElementById('crystal-health');
        if (crystalHealthElement) {
            const healthPercentage = Math.max(0, Math.floor((this.crystalHealth / this.crystalMaxHealth) * 100));
            crystalHealthElement.textContent = `${healthPercentage}%`;
            
            // Update health bar if it exists
            const healthBar = document.getElementById('crystal-health-bar');
            if (healthBar) {
                healthBar.style.width = `${healthPercentage}%`;
            }
        }
        
        // Play damage animation if feature is enabled
        if (settings.crystal.blinkOnDamage && !this.isDamageAnimationPlaying) {
            this.playDamageAnimation();
        }
        
        // Log damage
        debugLog(`Crystal took ${damage} damage! Health remaining: ${this.crystalHealth}`);
        
        // Check if crystal is destroyed
        if (this.crystalHealth <= 0 && !this.isGameOver) {
            this.crystalHealth = 0;
            this.gameOver();
        }
    }
    
    playDamageAnimation() {
        this.isDamageAnimationPlaying = true;
        this.damageAnimationStartTime = Date.now();
        
        // Change crystal color to damage color
        this.crystal.material.color.setHex(this.crystalDamageColor);
    }
    
    updateDamageAnimation() {
        if (!this.isDamageAnimationPlaying) return;
        
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.damageAnimationStartTime;
        
        if (elapsedTime >= this.damageAnimationDuration) {
            // Animation finished, revert to original color
            this.crystal.material.color.setHex(this.crystalOriginalColor);
            this.isDamageAnimationPlaying = false;
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        debugLog("Crystal destroyed! Game Over!");
        
        // Call game over callback if defined
        if (typeof this.onGameOver === 'function') {
            this.onGameOver();
        }
    }
    
    render(currentTime) {
        // Rotate the crystal slowly for a vibrant effect
        if (this.crystal) {
            this.crystal.rotation.y += 0.005;
        }
        
        // Update damage animation if playing
        this.updateDamageAnimation();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    getCrystal() {
        return this.crystal;
    }
}
