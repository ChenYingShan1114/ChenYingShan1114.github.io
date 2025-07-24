import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'dat.gui';

var container = document.getElementById('threejs-container-animation');
var width = container.offsetWidth;
var height = container.offsetHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial();
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;

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

const controls = new OrbitControls( camera, renderer.domElement );


function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += parameters.speed;
    // cube.rotation.y += parameters.speed;
    cube.material.color.set(parameters.color);
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