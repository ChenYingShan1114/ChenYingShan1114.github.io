import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Set up scene, camera, renderer
var container = document.getElementById('threejs-walle-container');
var width = container.offsetWidth;
var height = container.offsetHeight;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const mtlLoader = new MTLLoader().setPath( '/self/mtl/' );
const materials = await mtlLoader.loadAsync( 'WallE.mtl' );
materials.preload();
const objLoader = new OBJLoader().setPath( '/self/obj/' );
//objLoader.setMaterials( materials ); // optional since OBJ asstes can be loaded without an accompanying MTL file

const object = await objLoader.loadAsync( 'WallE.obj' );
scene.add( object );
console.log(object);
object.scale.setScalar( 10 );
object.position.z = -50;
object.rotation.y = -90;
camera.position.y = 10
camera.position.z = 0;

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add( ambientLight );
const directionalLight = new THREE.DirectionalLight(0x0cccc0, 0.8);
scene.add( directionalLight );
const spotLight1 = new THREE.SpotLight(0xccc000);
scene.add(spotLight1);
spotLight1.castShadow = true;
const sLightHelper1 = new THREE.SpotLightHelper(spotLight1);
scene.add(sLightHelper1);
sLightHelper1.visible = true;

const spotLight2 = new THREE.SpotLight(0x000ccc);
scene.add(spotLight2);
spotLight2.castShadow = true;
const sLightHelper2 = new THREE.SpotLightHelper(spotLight2);
scene.add(sLightHelper2);
sLightHelper2.visible = true;

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', function() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});