/**
 * Renderer component
 * Handles all Three.js scene setup and rendering
 */

import { settings } from '../config/settings.js';
import { handleResize, createColorMaterial } from '../utils/helpers.js';

export class Renderer {
    constructor() {
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Floor and skybox
        this.floor = null;
    }
    
    initialize() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.createFloor();
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
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
