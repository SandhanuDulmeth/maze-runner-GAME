// E:\sandhanu\icet\Project\Mos Burger\maze-runner-GAME\camera.js
function createCamera(aspect) {
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    const cameraDistance = 2;
    const cameraHeight = 1.2;
    camera.position.set(0, cameraHeight, cameraDistance);
    return { camera, cameraDistance, cameraHeight };
}

function getMapViewPosition(mazeSize) {
    return new THREE.Vector3(0, mazeSize * 2, 0);
}