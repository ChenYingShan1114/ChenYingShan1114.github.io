import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

var container = document.getElementById('threejs-container-physics');
var width = container.offsetWidth;
var height = container.offsetHeight;
var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
var camera = new THREE.OrthographicCamera(-2.2, 2.2, 2.2, -2.2, 0.0001, 20000);
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.setClearColor("rgb(0%, 0%, 0%)");
container.appendChild(renderer.domElement);

camera.position.y = -0.5;
camera.position.z = 2;

// const axesHelper = new THREE.AxesHelper( 50 );
// scene.add( axesHelper );

// node sphere
const sphere_1 = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 32, 32 ), new THREE.MeshStandardMaterial( ) );
const sphere_2 = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 32, 32 ), new THREE.MeshStandardMaterial(  ) );
[sphere_1, sphere_2].forEach(sphere => {
    scene.add(sphere);
});

// lights
const ambientLight = new THREE.AmbientLight("rgb(100%, 100%, 100%)");
scene.add( ambientLight );

const spotLight1 = new THREE.SpotLight("rgb(20%, 0%, 0%)");
spotLight1.position.set(Math.cos(Math.PI / 6) * 1, Math.sin(Math.PI / 6) * 1, 5);
// const sLightHelper1 = new THREE.SpotLightHelper(spotLight1);
// scene.add(sLightHelper1);
// sLightHelper1.visible = false;

const spotLight2 = new THREE.SpotLight("rgb(0%, 20%, 0%)");
spotLight2.position.set(Math.cos(Math.PI * 5 / 6) * 1, Math.sin(Math.PI * 5 / 6) * 1, 5);
// const sLightHelper2 = new THREE.SpotLightHelper(spotLight2);
// scene.add(sLightHelper2);
// sLightHelper2.visible = false;

const spotLight3 = new THREE.SpotLight("rgb(0%, 0%, 20%)");
spotLight3.position.set(Math.cos(Math.PI * 9 / 6) * 1, Math.sin(Math.PI * 9 / 6) * 1, 5);
// const sLightHelper3 = new THREE.SpotLightHelper(spotLight3);
// scene.add(sLightHelper3);
// sLightHelper3.visible = false;

[spotLight1, spotLight2, spotLight3].forEach(light => {
    scene.add(light);
    light.angle = 0.5;
    light.penumbra = 1;
    light.intensity = 2000;
});

// gui
const gui = new GUI({ autoPlace: false, width: 150 });
gui.close();
var customContainer = $('.moveGUI-physics').append($(gui.domElement));
const parameters = {
    theta1: 60,
    theta2: 60,
    update: init_pendulum
    
};
gui.add(parameters, 'theta1', 0, 180).step(1).name("\u03b81 (\u00b0)");
gui.add(parameters, 'theta2', 0, 179).step(1).name("\u03b82 (\u00b0)");
gui.add(parameters, 'update').name( 'reset pendulum!' );

function alpha1(theta1, theta2, omega1, omega2, time){
    let numerator = -g * (2 * m1 + m2) * Math.sin(theta1) - m2 * g * Math.sin(theta1 - 2 * theta2) - 2 * Math.sin(theta1 - theta2) * m2 * (omega2 * omega2 * l2 + omega1 * omega1 * l1 * Math.cos(theta1 - theta2))
    let denominator = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
    return numerator / denominator; 
}

function alpha2(theta1, theta2, omega1, omega2, time){
    let numerator = 2 * Math.sin(theta1 - theta2) * (omega1 * omega1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(theta1) + omega2 * omega2 * l2 * m2 * Math.cos(theta1 - theta2))
    let denominator = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2))
    return numerator / denominator;
}

function energy(theta1, theta2, omega1, omega2, time) {
    let KE1 = 0.5 * m1 * l1 * l1 * omega1 * omega1;
    let KE2 = 0.5 * m2 * (l1 * l1 * omega1 * omega1 + l2 * l2 * omega2 * omega2 + m2 * l1 * l2 * omega1 * omega2 * Math.cos(theta2 - theta1));
    let PE1 = -m1 * g * l1 * Math.cos(theta1);
    let PE2 = -m2 * g * (l1 * Math.cos(theta1) + l2 * Math.cos(theta2));
    return KE1 + KE2 + PE1 + PE2;
}

function p1(theta1, theta2) {
    let x = l1 * Math.sin(theta1);
    let y = -l1 * Math.cos(theta1);
    let z = 0;
    return new THREE.Vector3(x, y, z);
}

function p2(theta1, theta2) {
    let x = l1 * Math.sin(theta1) + l2 * Math.sin(theta2);
    let y = -l1 * Math.cos(theta1) - l2 * Math.cos(theta2);
    let z = 0;
    return new THREE.Vector3(x, y, z);
}

const degToRad = deg => deg * Math.PI / 180;

function init_pendulum() {
    omega1.length = omega2.length = theta1.length = theta2.length = t_now.length = 0;

    omega1.push(0); omega2.push(0); theta1.push(degToRad(parameters.theta1)); theta2.push(degToRad(parameters.theta2)); t_now.push(0);
    sphere_1.position.copy(p1(theta1[0], theta2[0]));
    sphere_2.position.copy(p2(theta1[0], theta2[0]));
    step = 0;
    accumulator = 0;
    for (const sphere of spheres) {
        sphere.visible = false;
    }
}

// set initial
const m1 = 1, m2 = 1, l1 = 1, l2 = 1, g = 9.8;
let clock =  new THREE.Clock();
let omega1 = [], omega2 = [], theta1 = [], theta2 = [], t_now = [];
omega1.push(0); omega2.push(0); theta1.push(Math.PI -0.1); theta2.push(Math.PI ); t_now.push(0);
let pos1 = p1(theta1[0], theta2[0]), pos2 = p2(theta1[0], theta2[0]);
sphere_1.position.copy(pos1);
sphere_2.position.copy(pos2);

const points = [new THREE.Vector3(0, 0, 0), pos1, pos2];
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
scene.add(line);

// Trail sphere pool
const spheres = [];
for (let i = 0; i < 10; i++) {
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.01 * 0.5 * (10 - i), 16, 8),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(1 - 0.1 * i, 1 - 0.1 * i, 1 - 0.1 * i) })
    );
    scene.add(sphere);
    spheres.push(sphere);
}

let accumulator = 0;
let dt = 0.01;
let step = 0;
let objects = [];
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    accumulator += delta;
    while( accumulator >= dt && step < 1000) {
        if (step > 50) {
            omega1.shift();
            omega2.shift();
            theta1.shift();
            theta2.shift();
            t_now.shift();
            step--;
        }
        // eular method
        omega1.push(omega1[step] + dt * alpha1(theta1[step], theta2[step], omega1[step], omega2[step], t_now[step]));
        omega2.push(omega2[step] + dt * alpha2(theta1[step], theta2[step], omega1[step], omega2[step], t_now[step]));
        theta1.push(theta1[step] + dt * omega1[step + 1]);
        theta2.push(theta2[step] + dt * omega2[step + 1]);
        t_now.push(t_now[step] + dt);
        step++;
        accumulator -= dt;
        
        pos1 = p1(theta1[step], theta2[step]);
        pos2 = p2(theta1[step], theta2[step]);
    
        sphere_1.position.copy(pos1);
        sphere_2.position.copy(pos2);
        // console.log(dt, step, t_now[step], theta1[step], theta2[step], omega1[step], omega2[step]);
        // console.log('energy: ', energy(theta1[step], theta2[step], omega1[step], omega2[step], t_now[step]));
        
        // Update line
        geometry.setFromPoints([new THREE.Vector3(0, 0, 0), pos1, pos2]);
        geometry.attributes.position.needsUpdate = true;

        // Update trail
        for (let i = 0; i < spheres.length; i++) {
            const index = step - 3 * (i + 1);
            if (index >= 0) {
                spheres[i].visible = true;
                spheres[i].position.copy(p2(theta1[index], theta2[index]));
            } else {
                spheres[i].visible = false;
            }
        }
    }
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