import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
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
renderer.shadowMap.enabled = true;

// initial light
const ambientLight = new THREE.AmbientLight("rgb(100%, 100%, 100%)", 3);
scene.add( ambientLight );

const spotLight1 = new THREE.SpotLight("rgb(10%, 10%, 10%)", 50, 0.5, 0.4, 1);
scene.add(spotLight1);
const targetObject1 = new THREE.Object3D(); 
scene.add(targetObject1);
targetObject1.position.set(0, 0.05, 0);
spotLight1.target = targetObject1;
// const sLightHelper1 = new THREE.SpotLightHelper(spotLight1);
// scene.add(sLightHelper1);

const spotLight2 = new THREE.SpotLight("rgb(10%, 10%, 10%)", 50, 0.5, 0.4, 1);
scene.add(spotLight2);
const targetObject2 = new THREE.Object3D(); 
scene.add(targetObject2);
targetObject2.position.set(0, 0.05, 0);
spotLight2.target = targetObject2;
// const sLightHelper2 = new THREE.SpotLightHelper(spotLight2);
// scene.add(sLightHelper2);

const spotLight3 = new THREE.SpotLight("rgb(10%, 10%, 10%)", 50, 0.5, 0.4, 1);
scene.add(spotLight3);
const targetObject3 = new THREE.Object3D(); 
scene.add(targetObject3);
targetObject3.position.set(0, 0.05, 0);
spotLight3.target = targetObject3;
// const sLightHelper3 = new THREE.SpotLightHelper(spotLight3);
// scene.add(sLightHelper3);

[spotLight1, spotLight2, spotLight3].forEach(light => {
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.far = 1;
    light.shadow.radius = 0.3;
    light.shadow.bias = -0.001;
});

// const axesHelper = new THREE.AxesHelper( 500 );
// scene.add( axesHelper );

// Animation mixer
let mixer = null;

// Load GLB with animation
const loader = new GLTFLoader();
loader.load('/self/glb/WalkCycle.glb', (gltf) => {
    let model = gltf.scene;
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            // child.receiveShadow = false;
            // child.material.side = THREE.DoubleSide;
        }
    });
    scene.add(model);
    
    // Setup animation mixer & play all animations
    mixer = new THREE.AnimationMixer(model);

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
camera.position.set(0.08, 0.06, 0.06);
controls.target.set(0, 0.05, 0);
controls.update();
controls.enableDamping = false;
controls.enablePan = false;
controls.maxDistance = 0.2;
controls.maxPolarAngle = Math.PI / 1.7;

const plane = new THREE.Mesh( new THREE.PlaneGeometry( 0.1, 10 ), new THREE.MeshStandardMaterial( {color: 0x550000, side: THREE.DoubleSide} ));
plane.rotation.set(-Math.PI / 2, 0, 0);
scene.add( plane );
plane.receiveShadow = true;

let sparking = true;
const gui = new GUI({ autoPlace: false, width: 150 });
gui.close();
// var customContainer = $('.moveGUI-animation').append($(gui.domElement));
document.querySelector('.moveGUI-animation')?.appendChild(gui.domElement);

const options = {
    intensity: 0.5,
    shadow: true,
    flash: true
};

gui.add(options, 'intensity', 0, 1);
gui.add(options, 'shadow').onChange(function(e){
    spotLight1.castShadow = e;
    spotLight2.castShadow = e;
    spotLight3.castShadow = e;
});
gui.add(options, 'flash').onChange(function(e){
    sparking = e;
});

let lastFrameTime = 0;
const targetFPS = 30;
function animate(now) {
    requestAnimationFrame(animate);
    const dt = now - lastFrameTime;
    if (dt < 1000 / targetFPS) return;

    lastFrameTime = now;
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);

    const delta_time = clock.getElapsedTime();

    spotLight1.position.set(0.05 * Math.cos(delta_time + Math.PI / 12), -0.05, 0.1 * Math.sin(delta_time));
    if (sparking) spotLight1.intensity = Math.round(Math.random()) * 100 * options.intensity;
    else spotLight1.intensity = 100 * options.intensity;
    // sLightHelper1.update();

    spotLight2.position.set(-0.05 * Math.cos(delta_time), 0.1, -0.1 * Math.sin(delta_time));
    if (sparking) spotLight2.intensity = Math.round(Math.random()) * 100 * options.intensity;
    else spotLight2.intensity = 100 * options.intensity;
    // sLightHelper2.update();

    spotLight3.position.set(0.05 * Math.cos(delta_time - Math.PI / 2), 0.15, 0.1 * Math.sin(delta_time));
    if (sparking) spotLight3.intensity = Math.round(Math.random()) * 100 * options.intensity;
    else spotLight3.intensity = 100 * options.intensity;
    // sLightHelper3.update();

}
animate();


window.addEventListener('resize', function() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    controls.update();
});