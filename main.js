// E:\sandhanu\icet\Project\Mos Burger\maze-runner-GAME\main.js
let mazeSize = 0;
document.addEventListener('DOMContentLoaded', () => {
    const difficultySelect = document.getElementById('difficulty-select');
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            mazeSize = parseInt(btn.dataset.size);
            difficultySelect.classList.add('hidden');
            initGame();
        });
    });
});

function initGame() {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    backgroundAndLighting(scene);

    const maze = Array(mazeSize).fill().map(() => Array(mazeSize).fill(1));
    const startPos = { x: 1, z: 1 };
    const endPos = { x: mazeSize - 2, z: mazeSize - 2 };

    generateMaze(mazeSize, startPos, endPos, maze);

    const startEndPositionsData = startEndPositions(mazeSize, startPos, endPos, scene);
    const endMarker = startEndPositionsData.endMarker;

    let endMarkerY = 0;

    const walls = [];

    const createStyledWall = (x, z) => {
        const wallGeometry = new THREE.BoxGeometry(1, 2, 1);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B0001,
            roughness: 0.7,
            metalness: 0.1
        });

        const wall = new THREE.Mesh(wallGeometry, wallMaterial);

        const edgesGeometry = new THREE.EdgesGeometry(wallGeometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 1
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

        wall.add(edges);

        wall.position.set(x - mazeSize / 2, 1, z - mazeSize / 2);

        wall.geometry.computeBoundingBox();
        wall.boundingBox = wall.geometry.boundingBox.clone();
        wall.boundingBox.min.add(wall.position);
        wall.boundingBox.max.add(wall.position);

        return wall;
    };

    for (let i = 0; i < mazeSize; i++) {
        for (let j = 0; j < mazeSize; j++) {
            if (maze[i][j] === 1) {
                const wall = createStyledWall(i, j);
                scene.add(wall);
                walls.push(wall);
            }
        }
    }

    const floorGeometry = new THREE.PlaneGeometry(mazeSize, mazeSize);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    const playerData = bestPlayer(scene);

    const player = playerData.player;
    const playerBoundingBox = playerData.playerBoundingBox;
    const playerSize = playerData.playerSize;
    const leftLeg = playerData.leftLeg;
    const rightLeg = playerData.rightLeg;
    const leftArm = playerData.leftArm;
    const rightArm = playerData.rightArm;
    const torso = playerData.torso;
    const neck = playerData.neck;
    const head = playerData.head;

    const cameraData = createCamera(window.innerWidth / window.innerHeight);
    const camera = cameraData.camera;
    const cameraDistance = cameraData.cameraDistance;
    const cameraHeight = cameraData.cameraHeight;

    let mouseX = 0;
    let targetRotation = 0;
    let isMouseLocked = false;
    const keys = {};
    let isMapView = false;
    const moveSpeed = 0.06;
    const turnSpeed = 0.002;
    let legAngle = 0;
    let gameWon = false;

    // Add these at the top of initGame()
    let isAnimating = false;
    let targetCameraPosition = new THREE.Vector3();
    let targetCameraLookAt = new THREE.Vector3();

    document.addEventListener('click', () => {
        if (!isMouseLocked) {
            pointerlockchange()
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isMouseLocked = document.pointerLockElement === renderer.domElement;
    });

    function pointerlockchange() {
        renderer.domElement.requestPointerLock();
    }

    document.addEventListener('mousemove', (e) => {
        if (isMouseLocked && !isMapView) {
            mouseX = e.movementX;
            targetRotation += -e.movementX * turnSpeed;
        }
    });

    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key.toLowerCase() === 'm') {
            if (isAnimating) return;

            const newMapViewState = !isMapView;
            const mazeCenter = new THREE.Vector3(0, 0, 0);

            // Set up animation targets
            if (newMapViewState) {
                // Transition to map view
                targetCameraPosition.set(0, mazeSize * 1, 0); // Increase height and distance for larger map view
                targetCameraLookAt.copy(mazeCenter);
            } else {
                // Transition back to player view
                const cameraOffset = new THREE.Vector3(0, cameraHeight, cameraDistance)
                    .applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
                targetCameraPosition.copy(player.position.clone().add(cameraOffset));
                targetCameraLookAt.copy(player.position.clone().add(new THREE.Vector3(0, 0.5, 0)));
            }

            // Start animation
            isAnimating = true;

            new TWEEN.Tween({
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            })
            .to({
                x: targetCameraPosition.x,
                y: targetCameraPosition.y,
                z: targetCameraPosition.z
            }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate((obj) => {
                camera.position.set(obj.x, obj.y, obj.z);

                // Smoothly adjust lookAt during transition
                const progress = obj.y / targetCameraPosition.y;
                const currentLookAt = new THREE.Vector3().lerpVectors(
                    isMapView ? targetCameraLookAt : mazeCenter,
                    newMapViewState ? mazeCenter : targetCameraLookAt,
                    progress
                );

                camera.lookAt(currentLookAt);
            })
            .onComplete(() => {
                isMapView = newMapViewState;
                isAnimating = false;

                // Force final lookAt position
                camera.lookAt(targetCameraLookAt);

                // Update UI
                if (isMapView) {
                    stats.dom.style.display = 'none';
                    document.getElementById('info').innerHTML = 'Press M to return to the game';
                } else {
                    stats.dom.style.display = 'block';
                    document.getElementById('info').innerHTML = 'Click to start | WASD or Arrow keys to move | Mouse to look around | M for map view | F for FullScreen ';
                }
            })
            .start();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    function checkCollision(newPosition) {
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

    function checkWinCondition() {
        const distance = player.position.distanceTo(endMarker.position);
        if (distance < 1 && !gameWon) {
            gameWon = true;
            document.getElementById('info').innerHTML = 'Congratulations! You reached the end! Press R to restart';
            document.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'r' && gameWon) {
                    location.reload();
                }
            });
        }
    }

    function adjustCameraPosition(idealPosition, lookAt) {
        const direction = new THREE.Vector3().subVectors(idealPosition, lookAt);
        const ray = new THREE.Raycaster(lookAt, direction.normalize());
        const intersects = ray.intersectObjects(walls);

        if (intersects.length > 0) {
            const distance = intersects[0].distance;
            if (distance < cameraDistance) {
                return lookAt.clone().add(direction.multiplyScalar(distance - 0.1));
            }
        }
        return idealPosition;
    }

    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'f') {
            toggleFullscreen();
        }
    });

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    var stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    function animate() {
        TWEEN.update(); // Add this at the top
        stats.begin();

        endMarkerY += 0.05;
        endMarker.position.y = 0.05 + Math.sin(endMarkerY) * 0.1;
        updateWallVisibility();
        if (!isMapView && !gameWon) {
            player.rotation.y += (targetRotation - player.rotation.y) * 0.1;

            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);

            let moved = false;
            const moveVector = new THREE.Vector3(0, 0, 0);

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
                // Normalize movement vector and apply speed
                moveVector.normalize().multiplyScalar(moveSpeed);

                // Update animation angle
                legAngle += 0.2;
                const swing = Math.sin(legAngle) * 0.2;

                // Swing legs (rotate the leg groups around the hip)
                leftLeg.rotation.x = swing;
                rightLeg.rotation.x = -swing;

                // Swing arms in the opposite phase for a natural walking motion
                leftArm.rotation.x = -swing;
                rightArm.rotation.x = swing;

                // Slight bobbing effect for the torso
                torso.position.y = 0.5 + Math.abs(Math.sin(legAngle * 2)) * 0.05;

                // Calculate and set the new player position if no collision
                const newPosition = player.position.clone().add(moveVector);
                if (!checkCollision(newPosition)) {
                    player.position.copy(newPosition);
                    checkWinCondition();
                }
            } else {
                // Reset limb rotations when not moving
                legAngle = 0;
                leftLeg.rotation.x = 0;
                rightLeg.rotation.x = 0;
                leftArm.rotation.x = 0;
                rightArm.rotation.x = 0;
                torso.position.y = 0.5;
            }

            const cameraOffset = new THREE.Vector3(
                0,
                cameraHeight,
                cameraDistance
            ).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);

            const idealCameraPos = player.position.clone().add(cameraOffset);
            const lookAtPos = player.position.clone().add(new THREE.Vector3(0, 0.5, 0));

            camera.position.copy(adjustCameraPosition(idealCameraPos, lookAtPos));
            camera.lookAt(lookAtPos);

            renderer.render(scene, camera);
        } else {
            camera.lookAt(isMapView ? new THREE.Vector3(0, 0, 0) : player.position);
            renderer.render(scene, camera); // Use camera instead of mapCamera
        }
        stats.end();
        requestAnimationFrame(animate);
    }

    function updateWallVisibility() {
        const visibilityDistance = 20;
        const playerPos = player.position;
        walls.forEach(wall => {
            const distance = wall.position.distanceTo(playerPos);
            wall.visible = distance < visibilityDistance;
        });
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

document.getElementById("More").addEventListener("click", function () {
    window.location.href = "test.html";
});
document.getElementById("difficulty-select").addEventListener("click", function () {
    console.log("clicked");
    const stopButton = document.getElementById("More");
    stopButton.disabled = true;
    stopButton.textContent = "Disabled";
    stopButton.style.opacity = 0.5;
});
