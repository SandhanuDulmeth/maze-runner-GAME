const Camera = {
    createMapCamera(mazeSize) {
        const mapCamera = new THREE.OrthographicCamera(
            -mazeSize / 2 - 1,
            mazeSize / 2 + 1,
            mazeSize / 2 + 1,
            -mazeSize / 2 - 1,
            0.1,
            1000
        );
        mapCamera.position.set(0, 15, 0);
        mapCamera.lookAt(0, 0, 0);

        return mapCamera;
    }
};

export default Camera;