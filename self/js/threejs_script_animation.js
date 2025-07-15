import * as THREE from 'three';

var container = document.getElementById('threejs-container-animation');
var width = container.offsetWidth;
var height = container.offsetHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
container.appendChild(renderer.domElement);


var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 3;


function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 1.00;
    cube.rotation.y += 1.00;
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