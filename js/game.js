// Check if Three.js is loaded correctly
console.log("Checking Three.js:", typeof THREE !== 'undefined' ? "Loaded successfully" : "Failed to load");

// Language Management class
class LanguageManager {
    constructor() {
        this.currentLanguage = 'pt-br'; // Default language
        this.translations = null;
        this.isLoaded = false;
        this.loadTranslations();
    }

    async loadTranslations() {
        try {
            const response = await fetch('assets/lang/translations.json');
            this.translations = await response.json();
            this.isLoaded = true;
            console.log("Translations loaded successfully");
            
            // Apply translations to the UI
            this.applyTranslations();
            
            // Setup language switcher
            this.setupLanguageSwitcher();
            
            // Dispatch an event when translations are loaded
            document.dispatchEvent(new CustomEvent('translationsLoaded'));
        } catch (error) {
            console.error("Error loading translations:", error);
        }
    }

    setLanguage(language) {
        if (this.translations && this.translations[language]) {
            this.currentLanguage = language;
            console.log(`Language changed to ${language}`);
            
            // Apply translations when language changes
            this.applyTranslations();
            
            // Update active language button
            const buttons = document.querySelectorAll('#language-toggle button');
            buttons.forEach(button => {
                button.classList.toggle('active', button.getAttribute('data-lang') === language);
            });
            
            // Dispatch an event when language changes
            document.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: this.currentLanguage } 
            }));
            
            return true;
        }
        return false;
    }

    get(key) {
        if (!this.isLoaded) {
            return key; // Return the key if translations are not loaded yet
        }
        
        // Parse nested keys like "menu.title"
        const keys = key.split('.');
        let result = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                console.warn(`Translation not found for key: ${key}`);
                return key;
            }
        }
        
        return result;
    }
    
    applyTranslations() {
        if (!this.isLoaded) return;
        
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.get(key);
        });
    }
    
    setupLanguageSwitcher() {
        const languageButtons = document.querySelectorAll('#language-toggle button');
        languageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const language = button.getAttribute('data-lang');
                this.setLanguage(language);
            });
        });
    }
    
    // Mapping for class names based on language
    getClassNameTranslation(className, targetLanguage) {
        // Define mapping between languages
        const classMapping = {
            'en': {
                'Guerreiro': 'Warrior', 
                'Arqueiro': 'Archer', 
                'Mago': 'Mage'
            },
            'pt-br': {
                'Warrior': 'Guerreiro', 
                'Archer': 'Arqueiro', 
                'Mage': 'Mago'
            }
        };
        
        // If we have mapping for the target language
        if (classMapping[targetLanguage] && classMapping[targetLanguage][className]) {
            return classMapping[targetLanguage][className];
        }
        
        // If no mapping found, return original
        return className;
    }
}

// Create a global language manager instance
const languageManager = new LanguageManager();

// Main game class
class VibingCrystalDefender {
    constructor() {
        // Setup basic Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Game state
        this.isGameRunning = false;
        
        // Player character class - default to null until selected
        this.playerClass = null;

        // Player movement properties
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.playerSpeed = 0.15;
        this.playerVelocity = new THREE.Vector3();

        // Arena boundaries
        this.arenaBoundary = 50; // Arena is 100x100, so boundaries are at +/- 50

        // Mobile controls
        this.isMobile = false;
        this.forceMobile = false; // Flag to force mobile mode for debugging
        this.leftJoystick = null;
        this.rightJoystick = null;
        this.leftJoystickManager = null;
        this.rightJoystickManager = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.joystickMovement = { x: 0, y: 0 };  // For tracking movement joystick
        this.touchingSurface = false;             // Flag to track if user is touching the screen
        this.mobileTouchSensitivity = 0.05;       // Reduced sensitivity for smoother camera rotation
        this.joystickDeadZone = 0.15;             // Dead zone for joysticks (ignores small movements)
        
        // Camera smoothing properties
        this.targetCameraRotation = { x: 0, y: 0 };
        this.smoothingFactor = 0.1;              // Lower = smoother but slower camera movement

        // Debug info
        this.debugMode = true;  // Set default to true to enable debugging
        this.errorLogEnabled = true;  // Enable error logging
        this.errorLog = [];  // Store error messages
        this.maxErrorLogSize = 10;  // Maximum number of error messages to show
        this.debugInfo = {
            deviceType: "",
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            leftJoystickActive: false,
            rightJoystickActive: false,
            leftJoystickValues: { x: 0, y: 0, angle: 0, force: 0 },
            rightJoystickValues: { x: 0, y: 0, angle: 0, force: 0 }
        };

        // Set mobile mode based on device or screen size
        this.checkMobileMode();
        
        // Initialize the character selection menu
        this.setupCharacterSelection();
        
        // Listen for language change events
        document.addEventListener('languageChanged', () => {
            // Update UI elements if needed
            if (this.playerClass) {
                // Convert class name based on the new language
                this.playerClass = languageManager.getClassNameTranslation(
                    this.playerClass, 
                    languageManager.currentLanguage
                );
                console.log(`Updated player class to: ${this.playerClass}`);
            }
        });
        
        // Do not initialize the game scene yet - wait for character selection
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
        
        // Now initialize the game
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

        // Setup debug UI
        this.setupDebugUI();

        // Set up controls based on device
        if (this.isMobile) {
            this.setupMobileControls();
        } else {
            this.setupControls();
        }

        // Add the floor
        this.createFloor();

        // Add event listeners
        window.addEventListener('resize', () => this.handleResize());
        this.setupEventListeners();

        // Start the render loop
        this.animate();

        // Hide loading screen once everything is ready
        document.getElementById('loading-screen').style.display = 'none';

        this.isGameRunning = true;
        console.log("Game initialization completed");
        console.log("Device type:", this.isMobile ? "Mobile" : "Desktop");
    }

    checkMobileMode() {
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouchDevice = 'ontouchstart' in window;
        const hasSmallScreen = window.innerWidth <= 900;

        // Set mobile mode if it's a mobile device, has touch capability, or has a small screen
        this.isMobile = this.forceMobile || isMobileDevice || (hasSmallScreen && isTouchDevice);

        // Update debug info
        this.debugInfo.deviceType = this.isMobile ? "Mobile" : "Desktop";
        this.debugInfo.screenWidth = window.innerWidth;
        this.debugInfo.screenHeight = window.innerHeight;

        return this.isMobile;
    }

    toggleMobileMode() {
        this.forceMobile = !this.forceMobile;
        this.checkMobileMode();

        // Clean up existing controls
        this.cleanupControls();

        // Setup new controls based on current mode
        if (this.isMobile) {
            this.setupMobileControls();
        } else {
            this.setupControls();
        }

        // Update UI
        document.getElementById('mobile-mode-status').textContent = this.isMobile ? "Mobile" : "Desktop";
        document.querySelectorAll('.joystick-zone').forEach(zone => {
            zone.style.display = this.isMobile ? 'block' : 'none';
        });

        // Update debug panel
        this.updateDebugInfo();
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        const debugPanel = document.getElementById('debug-panel');
        debugPanel.style.display = this.debugMode ? 'block' : 'none';
    }

    setupDebugUI() {
        // Create debug toggle button
        const debugToggle = document.createElement('button');
        debugToggle.id = 'debug-toggle';
        debugToggle.textContent = 'Debug';
        debugToggle.className = 'debug-control';
        debugToggle.addEventListener('click', () => this.toggleDebugMode());
        document.body.appendChild(debugToggle);

        // Create mode toggle button
        const modeToggle = document.createElement('button');
        modeToggle.id = 'mode-toggle';
        modeToggle.textContent = 'Toggle Mobile';
        modeToggle.className = 'debug-control';
        modeToggle.addEventListener('click', () => this.toggleMobileMode());
        document.body.appendChild(modeToggle);

        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.innerHTML = `
            <h3>Debug Info</h3>
            <div>Mode: <span id="mobile-mode-status">${this.isMobile ? "Mobile" : "Desktop"}</span></div>
            <div>Screen: <span id="screen-size">${window.innerWidth}x${window.innerHeight}</span></div>
            <div>
                <h4>Left Joystick</h4>
                <div>Active: <span id="left-active">false</span></div>
                <div>X: <span id="left-x">0</span></div>
                <div>Y: <span id="left-y">0</span></div>
                <div>Angle: <span id="left-angle">0</span></div>
                <div>Force: <span id="left-force">0</span></div>
            </div>
            <div>
                <h4>Right Joystick</h4>
                <div>Active: <span id="right-active">false</span></div>
                <div>X: <span id="right-x">0</span></div>
                <div>Y: <span id="right-y">0</span></div>
                <div>Angle: <span id="right-angle">0</span></div>
                <div>Force: <span id="right-force">0</span></div>
            </div>
        `;
        debugPanel.style.display = this.debugMode ? 'block' : 'none';
        document.body.appendChild(debugPanel);
    }

    updateDebugInfo() {
        if (!this.debugMode) return;

        document.getElementById('mobile-mode-status').textContent = this.isMobile ? "Mobile" : "Desktop";
        document.getElementById('screen-size').textContent = `${window.innerWidth}x${window.innerHeight}`;

        // Update left joystick info
        document.getElementById('left-active').textContent = this.debugInfo.leftJoystickActive.toString();
        document.getElementById('left-x').textContent = this.debugInfo.leftJoystickValues.x.toFixed(2);
        document.getElementById('left-y').textContent = this.debugInfo.leftJoystickValues.y.toFixed(2);
        document.getElementById('left-angle').textContent = this.debugInfo.leftJoystickValues.angle.toFixed(2);
        document.getElementById('left-force').textContent = this.debugInfo.leftJoystickValues.force.toFixed(2);

        // Update right joystick info
        document.getElementById('right-active').textContent = this.debugInfo.rightJoystickActive.toString();
        document.getElementById('right-x').textContent = this.debugInfo.rightJoystickValues.x.toFixed(2);
        document.getElementById('right-y').textContent = this.debugInfo.rightJoystickValues.y.toFixed(2);
        document.getElementById('right-angle').textContent = this.debugInfo.rightJoystickValues.angle.toFixed(2);
        document.getElementById('right-force').textContent = this.debugInfo.rightJoystickValues.force.toFixed(2);
    }

    cleanupControls() {
        // Clean up mobile joysticks if they exist
        if (this.leftJoystickManager) {
            this.leftJoystickManager.destroy();
            this.leftJoystickManager = null;
            this.leftJoystick = null;
        }
        
        if (this.rightJoystickManager) {
            this.rightJoystickManager.destroy();
            this.rightJoystickManager = null;
            this.rightJoystick = null;
        }

        // Reset joystick movement data
        this.joystickMovement = { x: 0, y: 0 };
        this.touchingSurface = false;

        // Remove keyboard event listeners
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
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
        
        // Initialize camera rotation target values
        this.targetCameraRotation = { 
            x: this.camera.rotation.x, 
            y: this.camera.rotation.y 
        };

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

    setupControls() {
        // Create PointerLockControls for camera rotation
        this.controls = new THREE.PointerLockControls(this.camera, this.renderer.domElement);

        // Add click event to lock controls
        this.renderer.domElement.addEventListener('click', () => {
            // Lock the pointer if controls aren't already locked
            if (!this.controls.isLocked) {
                this.controls.lock();
            }
        });

        // Add controls event listeners
        this.controls.addEventListener('lock', () => {
            console.log("Controls locked");
        });

        this.controls.addEventListener('unlock', () => {
            console.log("Controls unlocked");
        });

        console.log("PointerLockControls created");
    }

    setupMobileControls() {
        console.log("Setting up mobile controls with dual joysticks");

        // Show both joystick zones
        document.getElementById('joystick-left').style.display = 'block';
        document.getElementById('joystick-right').style.display = 'block';

        // Define specific options for each joystick
        const leftJoystickOptions = {
            zone: document.getElementById('joystick-left'),
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 100,
            multitouch: true,
            maxNumberOfNipples: 2,
            dataOnly: false
        };

        const rightJoystickOptions = {
            zone: document.getElementById('joystick-right'),
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 100,
            multitouch: true,
            maxNumberOfNipples: 2,
            dataOnly: false
        };

        // Create the joysticks with their specific managers
        this.leftJoystickManager = nipplejs.create(leftJoystickOptions);
        this.rightJoystickManager = nipplejs.create(rightJoystickOptions);

        // Reference the first nipple in each manager
        this.leftJoystick = this.leftJoystickManager[0];
        this.rightJoystick = this.rightJoystickManager[0];

        // Add event listeners for left joystick manager (movement)
        this.leftJoystickManager.on('move', (event, data) => {
            // Ensure we only process events from the left joystick
            if (data.identifier !== this.leftJoystick.identifier) return;
            
            const angle = data.angle.radian;
            const force = Math.min(data.force, 1); // Limit force to 1

            // Calculate movement vector based on joystick angle and force
            this.joystickMovement.x = Math.cos(angle) * force;
            this.joystickMovement.y = Math.sin(angle) * force;

            // Update debug info
            this.debugInfo.leftJoystickActive = true;
            this.debugInfo.leftJoystickValues = {
                x: this.joystickMovement.x,
                y: this.joystickMovement.y,
                angle: angle,
                force: force
            };
            this.updateDebugInfo();
        });

        this.leftJoystickManager.on('end', (event, data) => {
            // Ensure we only process events from the left joystick
            if (data.identifier !== this.leftJoystick.identifier) return;
            
            // Reset movement when joystick is released
            this.joystickMovement.x = 0;
            this.joystickMovement.y = 0;

            // Update debug info
            this.debugInfo.leftJoystickActive = false;
            this.updateDebugInfo();
        });

        // Add event listeners for right joystick manager (camera rotation)
        this.rightJoystickManager.on('move', (event, data) => {
            // Ensure we only process events from the right joystick
            if (data.identifier !== this.rightJoystick.identifier) return;
            
            const angle = data.angle.radian;
            const force = Math.min(data.force, 1); // Limit force to 1
            
            // Calculate rotation values based on joystick position
            // X-axis controls horizontal rotation (yaw)
            // Y-axis controls vertical rotation (pitch)
            const deltaX = Math.cos(angle) * force * 2; // Horizontal rotation
            const deltaY = Math.sin(angle) * force * 2; // Vertical rotation
            
            // Apply rotation
            this.rotateCamera(deltaX, deltaY);
            
            // Update debug info
            this.debugInfo.rightJoystickActive = true;
            this.debugInfo.rightJoystickValues = {
                x: deltaX,
                y: deltaY,
                angle: angle,
                force: force
            };
            this.updateDebugInfo();
        });

        this.rightJoystickManager.on('end', (event, data) => {
            // Ensure we only process events from the right joystick
            if (data.identifier !== this.rightJoystick.identifier) return;
            
            // Update debug info
            this.debugInfo.rightJoystickActive = false;
            this.updateDebugInfo();
        });

        console.log("Dual joystick mobile controls initialized with multitouch support");
    }

    rotateCamera(deltaX, deltaY) {
        // 1. Definir ordem de rotação para FPS (crucial!)
        this.camera.rotation.order = 'YXZ'; // Yaw (Y) primeiro, depois Pitch (X)

        // 2. Definir a rotação alvo com base nos inputs
        this.targetCameraRotation.y -= deltaX * this.mobileTouchSensitivity;
        this.targetCameraRotation.x += deltaY * this.mobileTouchSensitivity;

        // 3. Limitar ângulo vertical alvo (85 graus convertidos para radianos)
        const maxPitch = THREE.MathUtils.degToRad(85);
        this.targetCameraRotation.x = THREE.MathUtils.clamp(
            this.targetCameraRotation.x, 
            -maxPitch, 
            maxPitch
        );

        // 4. Suavizar a transição para a rotação alvo
        this.camera.rotation.y += (this.targetCameraRotation.y - this.camera.rotation.y) * this.smoothingFactor;
        this.camera.rotation.x += (this.targetCameraRotation.x - this.camera.rotation.x) * this.smoothingFactor;
    }

    setupEventListeners() {
        // Only add keyboard event listeners for desktop
        if (!this.isMobile) {
            this.onKeyDown = (event) => this.handleKeyDown(event);
            this.onKeyUp = (event) => this.handleKeyUp(event);

            document.addEventListener('keydown', this.onKeyDown);
            document.addEventListener('keyup', this.onKeyUp);
            console.log("Keyboard event listeners set up");
        }
    }

    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false;
                break;
        }
    }

    updatePlayerMovement() {
        if (this.isMobile) {
            this.updateMobileMovement();
        } else {
            // Only perform desktop movement if controls are locked
            if (!this.controls.isLocked) return;
            this.updateDesktopMovement();
        }
    }

    updateDesktopMovement() {
        // Calculate player direction
        const direction = new THREE.Vector3();

        // Get direction from camera
        this.camera.getWorldDirection(direction);
        direction.y = 0; // Keep movement in the xz plane
        direction.normalize();

        // Calculate forward/backward movement
        if (this.moveForward) {
            this.playerVelocity.add(direction.clone().multiplyScalar(this.playerSpeed));
        }
        if (this.moveBackward) {
            this.playerVelocity.add(direction.clone().multiplyScalar(-this.playerSpeed));
        }

        // Calculate left/right movement (perpendicular to direction)
        const rightVector = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
        if (this.moveRight) {
            this.playerVelocity.add(rightVector.clone().multiplyScalar(this.playerSpeed));
        }
        if (this.moveLeft) {
            this.playerVelocity.add(rightVector.clone().multiplyScalar(-this.playerSpeed));
        }

        // Apply movement to camera position
        this.camera.position.add(this.playerVelocity);

        // Apply arena boundaries
        this.camera.position.x = Math.max(-this.arenaBoundary, Math.min(this.arenaBoundary, this.camera.position.x));
        this.camera.position.z = Math.max(-this.arenaBoundary, Math.min(this.arenaBoundary, this.camera.position.z));

        // Reset velocity (no physics/inertia for now)
        this.playerVelocity.set(0, 0, 0);
    }

    updateMobileMovement() {
        // Skip if no input from joystick
        if (Math.abs(this.joystickMovement.x) < this.joystickDeadZone && 
            Math.abs(this.joystickMovement.y) < this.joystickDeadZone) {
            return;
        }

        // Get camera direction for movement relative to camera orientation
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Keep movement in the xz plane
        cameraDirection.normalize();

        // Get the right vector (perpendicular to direction)
        const rightVector = new THREE.Vector3().crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

        // Calculate movement vectors based on joystick input
        // Note: For joystick, up = negative Y and down = positive Y
        const forwardVector = cameraDirection.clone().multiplyScalar(this.joystickMovement.y * this.playerSpeed);
        const rightwardVector = rightVector.clone().multiplyScalar(this.joystickMovement.x * this.playerSpeed);

        // Combine movements
        this.playerVelocity.set(0, 0, 0); // Reset velocity first
        this.playerVelocity.add(forwardVector); // Add forward/backward movement
        this.playerVelocity.add(rightwardVector); // Add left/right movement

        // Apply movement to camera position
        this.camera.position.add(this.playerVelocity);

        // Apply arena boundaries
        this.camera.position.x = Math.max(-this.arenaBoundary, Math.min(this.arenaBoundary, this.camera.position.x));
        this.camera.position.z = Math.max(-this.arenaBoundary, Math.min(this.arenaBoundary, this.camera.position.z));
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

    handleResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Check if we need to switch control modes based on new screen size
        const previousMode = this.isMobile;
        this.checkMobileMode();

        // If the mode changed, update controls
        if (previousMode !== this.isMobile) {
            this.cleanupControls();
            if (this.isMobile) {
                this.setupMobileControls();
            } else {
                this.setupControls();
            }
        }

        // Update debug info
        this.debugInfo.screenWidth = window.innerWidth;
        this.debugInfo.screenHeight = window.innerHeight;
        this.updateDebugInfo();

        console.log("Resized renderer to", window.innerWidth, "x", window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update player movement
        this.updatePlayerMovement();

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the page is fully loaded
window.addEventListener('load', () => {
    console.log("Page loaded, creating game instance");
    const game = new VibingCrystalDefender();
});
