function createCamera(aspect) {
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    const cameraDistance = 2;
    const cameraHeight = 1.2;
    camera.position.set(0, cameraHeight, cameraDistance);
    return {camera , cameraDistance, cameraHeight}; ;
}

function createMapCamera(mazeSize) {
    const mapCamera = new THREE.OrthographicCamera(
        -mazeSize / 2 - 1,
            mazeSize / 2 + 1,
            mazeSize / 2 + 1,
            -mazeSize / 2 - 1,
        0.1, 1000
    );
    mapCamera.position.set(0, 15, 0);
    mapCamera.lookAt(0, 0, 0);
    return mapCamera;
}