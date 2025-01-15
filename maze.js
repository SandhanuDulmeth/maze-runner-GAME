const Maze = {
    createMaze(mazeSize, scene) {
        const maze = Array(mazeSize).fill().map(() => Array(mazeSize).fill(1));
        const walls = [];
        const startPos = { x: 1, z: 1 };
        const endPos = { x: mazeSize - 2, z: mazeSize - 2 };

        function generateMazePaths() {
            for (let i = 0; i < mazeSize; i++) {
                for (let j = 0; j < mazeSize; j++) {
                    if (i === 0 || i === mazeSize-1 || j === 0 || j === mazeSize-1) {
                        maze[i][j] = 1;
                    } else {
                        maze[i][j] = Math.random() < 0.4 ? 1 : 0;
                    }
                }
            }
            
            // Clear starting and ending areas
            for (let i = 1; i < 4; i++) {
                for (let j = 1; j < 4; j++) {
                    maze[i][j] = 0;
                }
            }
            
            for (let i = mazeSize - 4; i < mazeSize - 1; i++) {
                for (let j = mazeSize - 4; j < mazeSize - 1; j++) {
                    maze[i][j] = 0;
                }
            }
        }

        function createMarkers() {
            // Create start marker
            const startMarkerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
            const startMarkerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
            const startMarker = new THREE.Mesh(startMarkerGeometry, startMarkerMaterial);
            startMarker.position.set(startPos.x - mazeSize / 2, 0.05, startPos.z - mazeSize / 2);
            scene.add(startMarker);

            // Create end marker
            const endMarkerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
            const endMarkerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            const endMarker = new THREE.Mesh(endMarkerGeometry, endMarkerMaterial);
            endMarker.position.set(endPos.x - mazeSize / 2, 0.05, endPos.z - mazeSize / 2);
            scene.add(endMarker);

            return { startMarker, endMarker };
        }

        function createWalls() {
            const wallGeometry = new THREE.BoxGeometry(1, 2, 1);
            const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });

            for (let i = 0; i < mazeSize; i++) {
                for (let j = 0; j < mazeSize; j++) {
                    if (maze[i][j] === 1) {
                        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                        wall.position.set(i - mazeSize / 2, 1, j - mazeSize / 2);
                        wall.geometry.computeBoundingBox();
                        wall.boundingBox = wall.geometry.boundingBox.clone();
                        wall.boundingBox.min.add(wall.position);
                        wall.boundingBox.max.add(wall.position);
                        scene.add(wall);
                        walls.push(wall);
                    }
                }
            }
        }

        function createFloor() {
            const floorGeometry = new THREE.PlaneGeometry(mazeSize, mazeSize);
            const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22, side: THREE.DoubleSide });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = Math.PI / 2;
            scene.add(floor);
            return floor;
        }

        // Initialize maze
        generateMazePaths();
        const markers = createMarkers();
        const floor = createFloor();
        createWalls();

        return {
            maze,
            walls,
            startPos,
            endPos,
            floor,
            startMarker: markers.startMarker,
            endMarker: markers.endMarker
        };
    }
};

export default Maze;