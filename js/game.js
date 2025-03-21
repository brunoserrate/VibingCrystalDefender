// Check if Three.js is loaded correctly
console.log("Checking Three.js:", typeof THREE !== 'undefined' ? "Loaded successfully" : "Failed to load");

// Main game class
class VibingCrystalDefender {
    constructor() {
        // Setup basic Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Game state
        this.isGameRunning = false;

        this.initialize();
    }

    initialize() {
        console.log("Game initialization started");

        // Create the scene
        this.setupScene();

        // Create the camera
        this.setupCamera();

        // Create the renderer
        this.setupRenderer();

        // Add the floor
        this.createFloor();

        // Add event listeners
        window.addEventListener('resize', () => this.handleResize());

        // Start the render loop
        this.animate();

        // Hide loading screen once everything is ready
        document.getElementById('loading-screen').style.display = 'none';

        this.isGameRunning = true;
        console.log("Game initialization completed");
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Light blue sky
        console.log("Scene created");
    }

    setupCamera() {
        // Create a perspective camera (FoV, aspect ratio, near, far)
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

        // Position the camera at the center of the arena, standing height
        this.camera.position.set(0, 1.6, 0); // x=0, y=1.6 (eye level), z=0
        this.camera.lookAt(new THREE.Vector3(0, 1.6, -1)); // Looking forward

        console.log("Camera created at position", this.camera.position);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Add the renderer's canvas to the DOM
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

        console.log("Floor created and added to scene");
    }

    handleResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        console.log("Resized renderer to", window.innerWidth, "x", window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the page is fully loaded
window.addEventListener('load', () => {
    console.log("Page loaded, starting game initialization");
    const game = new VibingCrystalDefender();
});
