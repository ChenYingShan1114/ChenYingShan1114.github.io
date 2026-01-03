import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Set up scene, camera, renderer
var container = document.getElementById('threejs-walle-container');
var width = container.offsetWidth;
var height = container.offsetHeight;

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const axesHelper = new THREE.AxesHelper( 50 );
// scene.add( axesHelper );

const mtlLoader = new MTLLoader().setPath( '/self/mtl/' );
const materials = await mtlLoader.loadAsync( 'WallE.mtl' );
materials.preload();
const objLoader = new OBJLoader().setPath( '/self/obj/' );
//objLoader.setMaterials( materials ); // optional since OBJ asstes can be loaded without an accompanying MTL file

const object = await objLoader.loadAsync( 'WallE.obj' );
scene.add( object );
console.log(object);
object.scale.setScalar( 10 );
object.position.y = -10;

camera.position.x = 50;
camera.position.y = 40;
camera.position.z = 50;

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add( ambientLight );
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
// scene.add( directionalLight );

const spotLight1 = new THREE.SpotLight(0xffee33, 500);
scene.add(spotLight1);
spotLight1.castShadow = true;
const sLightHelper1 = new THREE.SpotLightHelper(spotLight1);
// scene.add(sLightHelper1);
sLightHelper1.visible = true;
spotLight1.position.x = 30;
spotLight1.position.y = 10;
spotLight1.rotation.z = -0.3 * Math.PI;

const spotLight2 = new THREE.SpotLight(0xee33ff, 300);
scene.add(spotLight2);
spotLight2.castShadow = true;
const sLightHelper2 = new THREE.SpotLightHelper(spotLight2);
// scene.add(sLightHelper2);
sLightHelper2.visible = true;
spotLight2.position.x = -10;
spotLight2.position.y = 30;
spotLight2.position.z = 15;
spotLight2.rotation.x = 0.2 * Math.PI;
spotLight2.rotation.z = 0.2 * Math.PI;

const spotLight3 = new THREE.SpotLight(0x33ffee, 300);
scene.add(spotLight3);
spotLight3.castShadow = true;
const sLightHelper3 = new THREE.SpotLightHelper(spotLight3);
// scene.add(sLightHelper3);
sLightHelper3.visible = true;
spotLight3.position.x = -30;
spotLight3.position.y = 0;
spotLight3.position.z = -20;
spotLight3.rotation.y = -0.3 * Math.PI;
spotLight3.rotation.z = 0.7 * Math.PI;

const controls = new OrbitControls( camera, renderer.domElement );
controls.autoRotate = true;
controls.enableDamping = true;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(0.01);
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