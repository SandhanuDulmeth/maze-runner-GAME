const Player = {
    createPlayer(mazeSize, scene) {
        const playerBody = new THREE.Group();
        const playerBoundingBox = new THREE.Box3();
        const playerSize = new THREE.Vector3(0.4, 0.6, 0.4);
        let legAngle = 0;

        function createPlayerModel() {
            // Create body
            const bodyGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.2);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.3;
            playerBody.add(body);

            // Create legs
            const legGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x008800 });

            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.1, 0.15, 0);
            playerBody.add(leftLeg);

            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.1, 0.15, 0);
            playerBody.add(rightLeg);

            return { body, leftLeg, rightLeg };
        }

        const { body, leftLeg, rightLeg } = createPlayerModel();
        playerBody.position.set(-mazeSize / 2 + 1.5, 0, -mazeSize / 2 + 1.5);
        scene.add(playerBody);

        function checkCollision(newPosition, walls) {
            playerBoundingBox.setFromCenterAndSize(
                new THREE.Vector3(newPosition.x, 0.3, newPosition.z),
                playerSize
            );

            for (const wall of walls) {
                if (playerBoundingBox.intersectsBox(wall.boundingBox)) {
                    return true;
                }
            }

            return false;
        }

        function updateAnimation(moved) {
            if (moved) {
                legAngle += 0.2;
                const legMovement = Math.sin(legAngle) * 0.2;
                leftLeg.position.z = legMovement;
                rightLeg.position.z = -legMovement;
                leftLeg.rotation.x = legMovement;
                rightLeg.rotation.x = -legMovement;
                body.position.y = 0.3 + Math.abs(Math.sin(legAngle * 2)) * 0.05;
            } else {
                legAngle = 0;
                leftLeg.position.z = 0;
                rightLeg.position.z = 0;
                leftLeg.rotation.x = 0;
                rightLeg.rotation.x = 0;
                body.position.y = 0.3;
            }
        }

        return {
            body: playerBody,
            update: function(controls, walls) {
                playerBody.rotation.y += (controls.targetRotation - playerBody.rotation.y) * 0.1;
                const moved = controls.updateMovement(playerBody, checkCollision, walls);
                updateAnimation(moved);
            },
            updateCamera: function(camera) {
                const cameraOffset = new THREE.Vector3(0, 1.2, 2)
                    .applyAxisAngle(new THREE.Vector3(0, 1, 0), playerBody.rotation.y);
                const idealCameraPos = playerBody.position.clone().add(cameraOffset);
                const lookAtPos = playerBody.position.clone().add(new THREE.Vector3(0, 0.5, 0));
                camera.position.copy(idealCameraPos);
                camera.lookAt(lookAtPos);
            }
        };
    }
};

export default Player;