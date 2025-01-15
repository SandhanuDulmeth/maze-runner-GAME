const Controls = {
    initControls(renderer, player, toggleMapView) {
        const keys = {};
        let isMouseLocked = false;
        let currentRotation = 0;
        let smoothedRotation = 0;
        const moveSpeed = 0.1;
        const turnSpeed = 0.002; // Reduced for smoother rotation
        const rotationLerpFactor = 0.1; // For smooth rotation interpolation

        document.addEventListener('click', () => {
            if (!isMouseLocked) {
                renderer.domElement.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            isMouseLocked = document.pointerLockElement === renderer.domElement;
        });

        document.addEventListener('mousemove', (e) => {
            if (isMouseLocked) {
                currentRotation += -e.movementX * turnSpeed;
            }
        });

        window.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'm') toggleMapView();
        });

        window.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        function updateMovement(playerBody, checkCollision, walls) {
            // Smoothly interpolate rotation
            smoothedRotation = THREE.MathUtils.lerp(
                smoothedRotation,
                currentRotation,
                rotationLerpFactor
            );
            playerBody.rotation.y = smoothedRotation;

            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                playerBody.rotation.y
            );
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                playerBody.rotation.y
            );

            let moved = false;
            const moveVector = new THREE.Vector3(0, 0, 0);

            // Movement controls
            if (keys['w'] || keys['arrowup']) {
                moveVector.add(forward);
                moved = true;
            }
            if (keys['s'] || keys['arrowdown']) {
                moveVector.sub(forward);
                moved = true;
            }
            if (keys['a'] || keys['arrowleft']) {
                moveVector.sub(right);
                moved = true;
            }
            if (keys['d'] || keys['arrowright']) {
                moveVector.add(right);
                moved = true;
            }

            if (moved) {
                moveVector.normalize().multiplyScalar(moveSpeed);
                const newPosition = playerBody.position.clone().add(moveVector);

                if (!checkCollision(newPosition, walls)) {
                    playerBody.position.copy(newPosition);
                }
            }

            return {
                moved,
                rotation: smoothedRotation
            };
        }

        return {
            updateMovement,
            getCurrentRotation: () => smoothedRotation
        };
    }
};

export default Controls;