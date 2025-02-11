function backgroundAndLighting(scene) {
    scene.background = new THREE.Color(0x87CEEB);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);


}



function generateMaze(mazeSize, startPos, endPos, maze) {

    function createMazePaths() {

        for (let i = 0; i < mazeSize; i++) {
            for (let j = 0; j < mazeSize; j++) {
                if (i === 0 || i === mazeSize - 1 || j === 0 || j === mazeSize - 1) {
                    maze[i][j] = 1;
                } else {
                    maze[i][j] = Math.random() < 0.4 ? 1 : 0;
                }
            }
        }


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


        function hasPath(startX, startY, endX, endY) {
            const visited = Array(mazeSize).fill().map(() => Array(mazeSize).fill(false));
            const stack = [[startX, startY]];

            while (stack.length > 0) {
                const [x, y] = stack.pop();

                if (x === endX && y === endY) return true;
                if (visited[x][y]) continue;

                visited[x][y] = true;


                const directions = [
                    [x + 1, y], [x - 1, y],
                    [x, y + 1], [x, y - 1]
                ];

                for (const [newX, newY] of directions) {
                    if (newX >= 0 && newX < mazeSize &&
                        newY >= 0 && newY < mazeSize &&
                        !maze[newX][newY] &&
                        !visited[newX][newY]) {
                        stack.push([newX, newY]);
                    }
                }
            }
            return false;
        }


        while (!hasPath(startPos.x, startPos.z, endPos.x, endPos.z)) {

            let currentX = startPos.x;
            let currentZ = startPos.z;

            while (currentX !== endPos.x || currentZ !== endPos.z) {
                if (Math.random() < 0.5 && currentX !== endPos.x) {

                    const nextX = currentX + (currentX < endPos.x ? 1 : -1);
                    maze[nextX][currentZ] = 0;
                    currentX = nextX;
                } else if (currentZ !== endPos.z) {

                    const nextZ = currentZ + (currentZ < endPos.z ? 1 : -1);
                    maze[currentX][nextZ] = 0;
                    currentZ = nextZ;
                }
            }
        }
    }
   createMazePaths();



}



function createWalls() {

}