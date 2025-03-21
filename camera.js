// E:\sandhanu\icet\Project\Mos Burger\maze-runner-GAME\camera.js
function createCamera(aspect) {
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    const cameraDistance = 2;
    const cameraHeight = 1.2;
    camera.position.set(0, cameraHeight, cameraDistance);
    return { camera, cameraDistance, cameraHeight };
}

function createMapCamera(mazeSize) {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, mazeSize * 2, 0);
    camera.lookAt(0, 0, 0);
    return camera;
}