function bestPlayer(scene) {
       // Create a master group for the player
       const player = new THREE.Group();

       // Define common materials
       const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22, shininess: 100 }); // Darker green for torso/neck
       const headMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700, shininess: 50 }); // Golden for head
       const limbMaterial = new THREE.MeshPhongMaterial({ color: 0x32CD32, shininess: 80 }); // Brighter green for limbs
       const visorMaterial = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 10 }); // Black for visor
   
       // --- Torso ---
       // Use a box geometry to create a defined torso shape
       const torsoGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.2);
       const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
       torso.position.y = 0.5;
       player.add(torso);
   
       // --- Neck ---
       // A small cylinder between torso and head for a natural look
       const neckGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
       const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
       neck.position.set(0, 0.8, 0);
       player.add(neck);
   
       // --- Head ---
       // A sphere for the head, mounted on the neck
       const headGeometry = new THREE.SphereGeometry(0.18, 16, 16);
       const head = new THREE.Mesh(headGeometry, headMaterial);
       head.position.set(0, 0.95, 0);
       player.add(head);
   
       // Add a visor to the head. Here we use a thin box placed on the front.
       const visorGeometry = new THREE.BoxGeometry(0.18, 0.06, 0.02);
       const visor = new THREE.Mesh(visorGeometry, visorMaterial);
       visor.position.set(0, 0.05, 0.16); // Slightly offset so it sits in front of the face
       head.add(visor);
   
       // --- Left Arm ---
       // Use a group for the whole arm so that you can rotate at the shoulder and animate the elbow later if needed.
       const leftArm = new THREE.Group();
       // Upper arm as a cylinder; note the pivot is on one end by offsetting its geometry.
       const leftUpperArmGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
       const leftUpperArm = new THREE.Mesh(leftUpperArmGeometry, limbMaterial);
       leftUpperArm.rotation.z = Math.PI / 2; // lay horizontally
       // Offset the mesh so the shoulder joint is at the group origin.
       leftUpperArm.position.set(-0.15, 0, 0);
       leftArm.add(leftUpperArm);
       // Position the whole arm relative to the torso.
       leftArm.position.set(-0.25, 0.65, 0);
       player.add(leftArm);
   
       // --- Right Arm ---
       const rightArm = new THREE.Group();
       const rightUpperArmGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
       const rightUpperArm = new THREE.Mesh(rightUpperArmGeometry, limbMaterial);
       rightUpperArm.rotation.z = -Math.PI / 2;
       rightUpperArm.position.set(0.15, 0, 0);
       rightArm.add(rightUpperArm);
       rightArm.position.set(0.25, 0.65, 0);
       player.add(rightArm);
   
       // --- Left Leg ---
       // Group for the leg allows for hip rotation and (if desired) knee bending.
       const leftLeg = new THREE.Group();
       const leftThighGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
       const leftThigh = new THREE.Mesh(leftThighGeometry, limbMaterial);
       // Offset so the hip joint is at the top of the leg group.
       leftThigh.position.set(0, -0.2, 0);
       leftLeg.add(leftThigh);
       leftLeg.position.set(-0.1, 0.2, 0);
       player.add(leftLeg);
   
       // --- Right Leg ---
       const rightLeg = new THREE.Group();
       const rightThighGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
       const rightThigh = new THREE.Mesh(rightThighGeometry, limbMaterial);
       rightThigh.position.set(0, -0.2, 0);
       rightLeg.add(rightThigh);
       rightLeg.position.set(0.1, 0.2, 0);
       player.add(rightLeg);
   
       // --- Position & Add to Scene ---
       // Position the player at the starting point (using mazeSize if defined globally)
       player.position.set(-mazeSize / 2 + 1.5, 0, -mazeSize / 2 + 1.5);
       scene.add(player);
   
       // --- Collision Data ---
       // Define a bounding box for collision detection.
       const playerBoundingBox = new THREE.Box3().setFromObject(player);
       // Approximate size vector (adjust based on your model)
       const playerSize = new THREE.Vector3(0.4, 1.2, 0.4);
   
       // Return all relevant parts for animation
       return {
           player,
           playerBoundingBox,
           playerSize,
           leftLeg,
           rightLeg,
           leftArm,
           rightArm,
           torso,
           neck,
           head
       };
}