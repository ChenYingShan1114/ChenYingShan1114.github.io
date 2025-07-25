import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

var container = document.getElementById('threejs-container-cg');
var width = container.offsetWidth;
var height = container.offsetHeight;
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setSize(width, height);
container.appendChild(renderer.domElement);
renderer.setAnimationLoop( animate );
renderer.setClearColor("rgb(0%, 0%, 0%)");

let clock =  new THREE.Clock();
const axesHelper = new THREE.AxesHelper( 100 );
scene.add( axesHelper );
axesHelper.visible = false;

// initial model parameters
const model = null;
const box = new THREE.Box3();
const box_center = new THREE.Vector3();
const box_size = new THREE.Vector3();
let max = 0;
let model_index = -1;

// initial camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.001, 1000);
const controls = new OrbitControls(camera, renderer.domElement);

// initial light
const ambientLight = new THREE.AmbientLight("rgb(30%, 30%, 30%)");
scene.add( ambientLight );

const spotLight1 = new THREE.SpotLight("rgb(20%, 0%, 0%)");
const sLightHelper1 = new THREE.SpotLightHelper(spotLight1);
scene.add(sLightHelper1);
sLightHelper1.visible = false;

const spotLight2 = new THREE.SpotLight("rgb(0%, 20%, 0%)");
const sLightHelper2 = new THREE.SpotLightHelper(spotLight2);
scene.add(sLightHelper2);
sLightHelper2.visible = false;

const spotLight3 = new THREE.SpotLight("rgb(0%, 0%, 20%)");
const sLightHelper3 = new THREE.SpotLightHelper(spotLight3);
scene.add(sLightHelper3);
sLightHelper3.visible = false;

[spotLight1, spotLight2, spotLight3].forEach(light => {
    scene.add(light);
    light.castShadow = false;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.radius = 30;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1;
    light.shadow.bias = -0.001;
});

// instantiate a loader
const loader = new OBJLoader();
let load_done = false;
// load a resource
loader.load(
    // resource URL
    '/self/obj/bunny.obj',
    function ( object ) {
            
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.material = new THREE.MeshStandardMaterial();
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        object.castShadow = true;
        object.receiveShadow = true;
        scene.add( object );
        model_index = scene.children.length - 1;

        //get AABB and its position
        box.setFromObject(object);
        box.getCenter(box_center);
        box_size.subVectors(box.max, box.min);
        max = 1.8 * Math.max(box_size.x, box_size.y, box_size.z);

        console.log('box center', box_center);
        console.log('box size', box_size);

        object.position.set(-box_center.x, -box_center.y, -box_center.z);

        //draw AABB
        const geometryCube = new THREE.BoxGeometry( box_size.x, box_size.y, box_size.z ); 
        const materialCube = new THREE.MeshStandardMaterial( {color: 0xffffff, wireframe: true} ); 
        const cube = new THREE.Mesh( geometryCube, materialCube ); 
        //cube.position.copy(box_center);
        cube.castShadow = true;
        //scene.add( cube );

        //set camera
        camera.position.set(0, 0.25 * box_size.y, max);
        controls.target.set(0, 0, 0);

        //set base
        const radius = Math.sqrt(box_size.x * box_size.x + box_size.z * box_size.z);
        const geometryCylinder = new THREE.CylinderGeometry( radius, radius, 0.5 * box_size.y, 64 ); 
        const materialCylinder = new THREE.MeshStandardMaterial( {color: "rgb(50%, 50%, 50%)"} ); 
        const cylinder = new THREE.Mesh( geometryCylinder, materialCylinder ); 
        cylinder.position.set(0, - (0.5 + 0.25) * box_size.y, 0);
        scene.add( cylinder );
        cylinder.receiveShadow = true;

        //set light1
        spotLight1.position.set(Math.cos(Math.PI / 6) * box_size.x, 1.5 * box_size.y, Math.sin(Math.PI / 6) * box_size.z);
        spotLight1.angle = 0.5;
        spotLight1.penumbra = 0.5;
        spotLight1.intensity = 100 * box_size.length();

        //set light2
        spotLight2.position.set(Math.cos(Math.PI * 5 / 6) * box_size.x, 1.5 * box_size.y, Math.sin(Math.PI * 5 / 6) * box_size.z);
        spotLight2.angle = 0.5;
        spotLight2.penumbra = 0.5;
        spotLight2.intensity = 100 * box_size.length();

        //set light3
        spotLight3.position.set(Math.cos(Math.PI * 9 / 6) * box_size.x, 1.5 * box_size.y, Math.sin(Math.PI * 9 / 6) * box_size.z);
        spotLight3.angle = 0.5;
        spotLight3.penumbra = 0.5;
        spotLight3.intensity = 100 * box_size.length();

        load_done = true;
    },
    // called when loading is in progress
    function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

        console.log( 'An error happened' );

    }
);

const gui = new GUI({ autoPlace: false, width: 150 });
gui.close();
var customContainer = $('.moveGUI-cg').append($(gui.domElement));
const options = {
    modelColor: '#ffffff',
    // helper: false,
    angle: 0.40,
    penumbra: 0.25,
    intensity: 10,
    shadow: false
};

gui.addColor(options, 'modelColor').onChange(function(e){
    scene.children[model_index].children[0].material.color.set( e );
}).name("bunny's color");
// gui.add(options, 'helper').onChange(function(e){
//     axesHelper.visible = e;
//     sLightHelper1.visible = e;
//     sLightHelper2.visible = e;
//     sLightHelper3.visible = e;
// });
gui.add(options, 'angle', 0, 0.6);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 50);
gui.add(options, 'shadow').onChange(function(e){
    spotLight1.castShadow = e;
    spotLight2.castShadow = e;
    spotLight3.castShadow = e;
});

function animate() {
    const speed = 0.5;
    const delta = speed * clock.getElapsedTime();
    //camera.position.set(max * Math.cos(delta) + box_center.x, box_center.y + 0.5 * box_size.y, max * Math.sin(delta) + box_center.z + 2 * box_size.z);
    //spotLight.color.setRGB( Math.random(), Math.random(), Math.random() );

    // 1. 用delta轉相機
    // 2. 在y=固定值轉
    // camera.position.set(1 * max * Math.cos(delta), 0.25 * box_size.y, 1 * max * Math.sin(delta));

    // 3. 給y一個震盪
    camera.position.set(1 * max * Math.cos(delta), 0.2 * max * Math.cos(delta) + 0.01, 1 * max * Math.sin(delta));
    controls.update();

    spotLight1.angle = options.angle;
    spotLight1.penumbra = options.penumbra;
    spotLight1.intensity = 10 * options.intensity * box_size.length();
    sLightHelper1.update();
    
    spotLight2.angle = options.angle;
    spotLight2.penumbra = options.penumbra;
    spotLight2.intensity = 10 * options.intensity * box_size.length();
    sLightHelper2.update();

    spotLight3.angle = options.angle;
    spotLight3.penumbra = options.penumbra;
    spotLight3.intensity = 10 * options.intensity * box_size.length();
    sLightHelper3.update();

    renderer.render( scene, camera );

}


window.addEventListener('resize', function() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});