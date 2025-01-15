const Scene = {
    createScene() {
        if (typeof THREE === 'undefined') {
            throw new Error('THREE.js not loaded');
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        return { scene, camera, renderer };
    },

    createLights(scene) {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        return { ambientLight, directionalLight };
    }
};

export default Scene;