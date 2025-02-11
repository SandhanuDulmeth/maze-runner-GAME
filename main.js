
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

    const startMarkerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    const startMarkerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const startMarker = new THREE.Mesh(startMarkerGeometry, startMarkerMaterial);
    startMarker.position.set(startPos.x - mazeSize / 2, 0.05, startPos.z - mazeSize / 2);
    scene.add(startMarker);

    const endMarkerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    const endMarkerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const endMarker = new THREE.Mesh(endMarkerGeometry, endMarkerMaterial);
    endMarker.position.set(endPos.x - mazeSize / 2, 0.05, endPos.z - mazeSize / 2);
    scene.add(endMarker);

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

    const playerData = player(scene);
    const playerBody = playerData.playerBody;
    const playerBoundingBox = playerData.playerBoundingBox;
    const playerSize = playerData.playerSize;
    const leftLeg = playerData.leftLeg;
    const rightLeg = playerData.rightLeg;
    const body = playerData.body;


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
            pointerlockchange();
            isMapView = !isMapView;
            if (isMapView) {
                stats.dom.style.display = 'none';
                document.getElementById('info').innerHTML = 'Press M to return to the game';

            } else {
                stats.dom.style.display = 'block';
                document.getElementById('info').innerHTML = 'Click to start | WASD or Arrow keys to move | Mouse to look around | M for map view | F for FullScreen ';
            }



        };
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;


    });

    const mapCamera = createMapCamera(mazeSize);


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
        const distance = playerBody.position.distanceTo(endMarker.position);
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
        stats.begin();
        requestAnimationFrame(animate);

        endMarkerY += 0.05;
        endMarker.position.y = 0.05 + Math.sin(endMarkerY) * 0.1;
        updateWallVisibility();
        if (!isMapView && !gameWon) {
            playerBody.rotation.y += (targetRotation - playerBody.rotation.y) * 0.1;

            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerBody.rotation.y);
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerBody.rotation.y);

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
                moveVector.normalize().multiplyScalar(moveSpeed);

                legAngle += 0.2;
                const legMovement = Math.sin(legAngle) * 0.2;
                leftLeg.position.z = legMovement;
                rightLeg.position.z = -legMovement;
                leftLeg.rotation.x = legMovement;
                rightLeg.rotation.x = -legMovement;
                body.position.y = 0.3 + Math.abs(Math.sin(legAngle * 2)) * 0.05;

                const newPosition = playerBody.position.clone().add(moveVector);

                if (!checkCollision(newPosition)) {
                    playerBody.position.copy(newPosition);
                    checkWinCondition();
                }
            } else {
                legAngle = 0;
                leftLeg.position.z = 0;
                rightLeg.position.z = 0;
                leftLeg.rotation.x = 0;
                rightLeg.rotation.x = 0;
                body.position.y = 0.3;
            }

            const cameraOffset = new THREE.Vector3(
                0,
                cameraHeight,
                cameraDistance
            ).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerBody.rotation.y);

            const idealCameraPos = playerBody.position.clone().add(cameraOffset);
            const lookAtPos = playerBody.position.clone().add(new THREE.Vector3(0, 0.5, 0));

            camera.position.copy(adjustCameraPosition(idealCameraPos, lookAtPos));
            camera.lookAt(lookAtPos);

            renderer.render(scene, camera);
        } else {
            renderer.render(scene, mapCamera);
        }
        stats.end();
        //requestAnimationFrame(animate);
    }
    function updateWallVisibility() {
        // Adjust the visibilityDistance value to suit your maze size
        const visibilityDistance = 20;
        const playerPos = playerBody.position;
        walls.forEach(wall => {
            // Use distance between wall and player to determine if wall should be visible
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
