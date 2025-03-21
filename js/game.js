// Check if Three.js is loaded correctly
console.log("Checking Three.js:", typeof THREE !== 'undefined' ? "Loaded successfully" : "Failed to load");

// Main game class
class VibingCrystalDefender {
    constructor() {
        this.initialize();
    }

    initialize() {
        console.log("Game initialization started");
        // Hide loading screen once everything is ready
        document.getElementById('loading-screen').style.display = 'none';
    }
}

// Start the game when the page is fully loaded
window.addEventListener('load', () => {
    console.log("Page loaded, starting game initialization");
    const game = new VibingCrystalDefender();
});
