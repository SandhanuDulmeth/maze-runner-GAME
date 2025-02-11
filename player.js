
function player(scene) {
    
const playerBody = new THREE.Group();
const bodyGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.2);
const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.3;
playerBody.add(body);

const playerBoundingBox = new THREE.Box3();
const playerSize = new THREE.Vector3(0.4, 0.6, 0.4);

const legGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
const legMaterial = new THREE.MeshPhongMaterial({ color: 0x008800 });

const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
leftLeg.position.set(-0.1, 0.15, 0);
playerBody.add(leftLeg);

const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
rightLeg.position.set(0.1, 0.15, 0);
playerBody.add(rightLeg);

playerBody.position.set(-mazeSize / 2 + 1.5, 0, -mazeSize / 2 + 1.5);
scene.add(playerBody);

return {
    playerBody,
    playerBoundingBox,
    playerSize,
    leftLeg,
    rightLeg,
    body

}

}


