import Scene from './scene.js';
import Maze from './maze.js';
import Player from './player.js';
import Controls from './controls.js';
import Camera from './camera.js';

// Wait for THREE.js to load
window.addEventListener('load', () => {
    if (typeof THREE === 'undefined') {
        console.error('THREE.js not loaded');
        return;
    }
    
    // Initialize main game objects
    const { scene, camera, renderer } = Scene.createScene();
    const { ambientLight, directionalLight } = Scene.createLights(scene);

    // Initialize game state
    const mazeSize = 20;
    const maze = Maze.createMaze(mazeSize, scene);
    const player = Player.createPlayer(mazeSize, scene);
    const mapCamera = Camera.createMapCamera(mazeSize);

    // Game state variables
    let isMapView = false;
    let gameWon = false;
    let endMarkerY = 0;

    // Initialize controls and event listeners
    const controls = Controls.initControls(renderer, player, () => isMapView = !isMapView);

    function animate() {
        requestAnimationFrame(animate);

        // Animate end marker
        endMarkerY += 0.05;
        maze.endMarker.position.y = 0.05 + Math.sin(endMarkerY) * 0.1;

        if (!isMapView && !gameWon) {
            player.update(controls, maze.walls);
            player.updateCamera(camera);
            renderer.render(scene, camera);
        } else {
            renderer.render(scene, mapCamera);
        }
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
});