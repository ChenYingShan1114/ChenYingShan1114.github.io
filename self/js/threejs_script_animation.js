import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; //很重要 要用到！
import { GUI } from 'dat.gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var container = document.getElementById('threejs-container-animation');
var width = container.offsetWidth;
var height = container.offsetHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.001, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
container.appendChild(renderer.domElement);
renderer.setClearColor("rgb(0%, 0%, 0%)");
renderer.setAnimationLoop( animate );

// initial light
const ambientLight = new THREE.AmbientLight("rgb(100%, 100%, 100%)");
scene.add( ambientLight );

// const spotLight1 = new THREE.SpotLight("rgb(20%, 0%, 0%)");
// const sLightHelper1 = new THREE.SpotLightHelper(spotLight1);
// scene.add(sLightHelper1);
// sLightHelper1.visible = true;

// const spotLight2 = new THREE.SpotLight("rgb(0%, 20%, 0%)");
// const sLightHelper2 = new THREE.SpotLightHelper(spotLight2);
// scene.add(sLightHelper2);
// sLightHelper2.visible = true;

// const spotLight3 = new THREE.SpotLight("rgb(0%, 0%, 20%)");
// const sLightHelper3 = new THREE.SpotLightHelper(spotLight3);
// scene.add(sLightHelper3);
// sLightHelper3.visible = true;
// //set light1
// spotLight1.position.set(Math.cos(Math.PI / 6), 1.5, Math.sin(Math.PI / 6));
// //set light2
// spotLight2.position.set(Math.cos(Math.PI * 5 / 6), 1.5, Math.sin(Math.PI * 5 / 6));
// //set light3
// spotLight3.position.set(Math.cos(Math.PI * 9 / 6), 1.5, Math.sin(Math.PI * 9 / 6));

// [spotLight1, spotLight2, spotLight3].forEach(light => {
//     scene.add(light);
//     light.angle = 0.5;
//     light.penumbra = 0.5;
//     light.intensity = 10000;
// });

const axesHelper = new THREE.AxesHelper( 500 );
scene.add( axesHelper );


// Animation mixer
let mixer = null;

// Load GLB with animation
const loader = new GLTFLoader();
loader.load('/self/glb/WalkCycle.glb', (gltf) => {
    scene.add(gltf.scene);

    // Setup animation mixer & play all animations
    mixer = new THREE.AnimationMixer(gltf.scene);

    gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
    });

}, undefined, (error) => {
    console.error(error);
});

// Animation loop
const clock = new THREE.Clock();


const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set(0.05, 0.05, 0.05);
controls.target.set(0, 0, 0);
controls.update();

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const gui = new GUI({ autoPlace: false });
gui.close();
var customContainer = $('.moveGUI-animation').append($(gui.domElement));
const parameters = {
    color: 0x0000ff,
    speed: 0.9
};
gui.addColor(parameters, 'color').onChange(function(colorValue) {
});
gui.add(parameters, 'speed', 0, 1).step(0.01);

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}
animate();


window.addEventListener('resize', function() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});