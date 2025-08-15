import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

var container = document.getElementById('threejs-container-quadcopter');
var width = container.offsetWidth;
var height = container.offsetHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.setAnimationLoop( animate );
container.appendChild(renderer.domElement);

// renderer.setClearColor("rgb(0%, 0%, 0%)");
// renderer.shadowMap.enabled = true;

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// initial light
const ambientLight = new THREE.AmbientLight("rgb(100%, 100%, 100%)", 3);
scene.add( ambientLight );

// Animation loop
const controls = new OrbitControls( camera, renderer.domElement );

const plane = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), new THREE.MeshStandardMaterial( {color: 0x888888, side: THREE.DoubleSide, wireframe: true} ));
scene.add( plane );

const point1 = [];
point1.push( new THREE.Vector3( 0, 0, 0.3 ) );
point1.push( new THREE.Vector3( 0.225, 0, 0.3 ) );
const line1 = new THREE.Line( new THREE.BufferGeometry().setFromPoints( point1 ), new THREE.LineBasicMaterial({ color: 0xfffffff }) );
const circle1 = new THREE.Mesh( new THREE.CircleGeometry( 0.05, 10 ), new THREE.MeshNormalMaterial( { side: THREE.DoubleSide } ) );
circle1.position.set(0.225, 0, 0.3);

const point2 = [];
point2.push( new THREE.Vector3( 0, 0, 0.3 ) );
point2.push( new THREE.Vector3( 0, 0.225, 0.3 ) );
const line2 = new THREE.Line( new THREE.BufferGeometry().setFromPoints( point2 ), new THREE.LineBasicMaterial({ color: 0xfffffff }) );
const circle2 = new THREE.Mesh( new THREE.CircleGeometry( 0.05, 10 ), new THREE.MeshNormalMaterial( { side: THREE.DoubleSide } ) );
circle2.position.set(0, 0.225, 0.3);

const point3 = [];
point3.push( new THREE.Vector3( 0, 0, 0.3 ) );
point3.push( new THREE.Vector3( -0.225, 0, 0.3 ) );
const line3 = new THREE.Line( new THREE.BufferGeometry().setFromPoints( point3 ), new THREE.LineBasicMaterial({ color: 0xfffffff }) );
const circle3 = new THREE.Mesh( new THREE.CircleGeometry( 0.05, 10 ), new THREE.MeshNormalMaterial( { side: THREE.DoubleSide } ) );
circle3.position.set(-0.225, 0, 0.3);

const point4 = [];
point4.push( new THREE.Vector3( 0, 0, 0.3 ) );
point4.push( new THREE.Vector3( 0, -0.225, 0.3 ) );
const line4 = new THREE.Line( new THREE.BufferGeometry().setFromPoints( point4 ), new THREE.LineBasicMaterial({ color: 0xfffffff }) );
const circle4 = new THREE.Mesh( new THREE.CircleGeometry( 0.05, 10 ), new THREE.MeshNormalMaterial( { side: THREE.DoubleSide } ) );
circle4.position.set(0, -0.225, 0.3);


const group = new THREE.Group();
[line1, line2, line3, line4, circle1, circle2, circle3, circle4].forEach(object => {
    group.add(object);
});
scene.add( group );

// Parameters
const ModelParam_c_T = 1.105e-05;    // 螺旋桨拉力系数
const ModelParam_c_M = 1.779e-07*2;  // 螺旋桨力矩系数
const ModelParam_d = 0.225;          // 机体中心和任一电机的距离(m)
const ModelParam_m = 1.4;            // 四旋翼飞行器质量(kg)
const ModelParam_g = 9.8;            // 重力加速度(m/s**2)
const ModelParam_I_xx = 0.0211;      // 四旋翼x轴转动惯量(kg·m**2)
const ModelParam_I_yy = 0.0219;      // 四旋翼y轴转动惯量(kg·m**2)
const ModelParam_I_zz = 0.0366;      // 四旋翼z轴转动惯量(kg·m**2)
const ModelParam_J_RP = 0.0001287;   // 整个电机转子和螺旋桨绕转轴的总转动惯量(kg·m**2)

// Equation of motion
/* acceleration */
function v_dot(m, g, phi, theta, psi, f) {
    let v_x_dot = -f * (1/m) * (Math.cos(psi) * Math.sin(theta) * Math.cos(phi) + Math.sin(psi) * Math.sin(phi));
    let v_y_dot = -f * (1/m) * (Math.sin(psi) * Math.sin(theta) * Math.cos(phi) - Math.cos(psi) * Math.sin(phi));
    let v_z_dot = g - f * (1/m) * Math.cos(phi) * Math.cos(theta);
    return new THREE.Vector3(v_x_dot, v_y_dot, v_z_dot);
}

/* angular acceleration */
function omega_dot(tau_x, tau_y, tau_z, w1, w2, w3, w4, I_xx, I_yy, I_zz, J_RP, p, q, r) {
    let Omega = -w1 + w2 - w3 + w4;
    let p_dot = (1/I_xx) * (tau_x + q * r * (I_yy - I_zz) - J_RP * q * Omega);
    let q_dot = (1/I_yy) * (tau_y + p * r * (I_zz - I_xx) + J_RP * p * Omega);
    let r_dot = (1/I_zz) * (tau_z + p * q * (I_xx - I_yy) );
    return new THREE.Vector3(p_dot, q_dot, r_dot);
}

/* modify angular velocity */
function omega_modify(p, q, r, phi, theta) {
    let phi_dot = p + q * Math.tan(theta) * Math.sin(phi) + r * Math.tan(theta) * Math.cos(phi);
    let theta_dot = q * Math.cos(phi) - r * Math.sin(phi);
    let psi_dot = q * Math.sin(phi) / Math.cos(theta) + r * Math.cos(phi) / Math.cos(theta);
    return new THREE.Vector3(phi_dot, theta_dot, psi_dot);
}

function force(w1, w2, w3, w4, c_T, c_M, d) {
// 函数描述
// 1.作用：本函数用来计算螺旋桨旋转产生的总拉力和反扭力矩。
// 2.函数输入：
//   wi：四个螺旋桨的转速(rad/s)
//   c_T：螺旋桨拉力系数
//   c_M：螺旋桨力矩系数
//   d：机体中心和任一电机的距离(m)
// 3.函数输出：
//   f：螺旋桨拉力（机体轴）
//   tau_x：x轴反扭力矩（机体轴）
//   tau_y：y轴反扭力矩（机体轴）
//   tau_z：z轴反扭力矩（机体轴）
// 4.四旋翼构型为“X”型，螺旋桨序号如下所示：
//            3↓   1↑
//              \ /
//              / \
//            2↑   4↓
//   其中，↑表示螺旋桨逆时针旋转；↓表示螺旋桨顺时针旋转。
    let f = c_T * (w1**2 + w2**2 + w3**2 + w4**2);
    let tau_x = d * c_T * (Math.sqrt(2)/2) * (-(w1**2) + w2**2 + w3**2 - w4**2);
    let tau_y = d * c_T * (Math.sqrt(2)/2) * (w1**2 - w2**2 + w3**2 - w4**2);
    let tau_z = c_M * (w1**2 + w2**2 - w3**2 - w4**2);
    return new THREE.Vector4(tau_x, tau_y, tau_z, f);
}

const gui = new GUI({ autoPlace: false, width: 150 });
gui.close();
// var customContainer = $('.moveGUI-animation').append($(gui.domElement));
document.querySelector('.moveGUI-quadcopter')?.appendChild(gui.domElement);
const options = {
    reset: init_quadcopter,
    omega_x: 0,
    omega_y: 0,
    omega_z: 0.5,
    v_x: 0,
    v_y: 0,
    v_z: 0,
    phi: 0,
    theta: 0,
    psi: 0,
    x: 0,
    y: 0,
    z: -1,   // 四旋翼初始高度
    w1: 557.142,      // rad/s 當懸停在空中時，螺旋槳產生的拉力與無人機所受到的重力相等。
    w2: 557.142,
    w3: 557.142,
    w4: 557.142
}
gui.add(options, 'reset').name( 'reset quadcopter!');
const omegaFolder = gui.addFolder('Omega');
omegaFolder.add(options, 'omega_x', -10, 10);
omegaFolder.add(options, 'omega_y', -10, 10);
omegaFolder.add(options, 'omega_z', -10, 10);
omegaFolder.open();
const vFolder = gui.addFolder('Velocity');
vFolder.add(options, 'v_x', -10, 10);
vFolder.add(options, 'v_y', -10, 10);
vFolder.add(options, 'v_z', -10, 10);
vFolder.open();
const angleFolder = gui.addFolder('Angle');
angleFolder.add(options, 'phi', -Math.PI, Math.PI);
angleFolder.add(options, 'theta', -Math.PI, Math.PI);
angleFolder.add(options, 'psi', -Math.PI, Math.PI);
angleFolder.open();
const positionFolder = gui.addFolder('Position');
positionFolder.add(options, 'x', -10, 10);
positionFolder.add(options, 'y', -10, 10);
positionFolder.add(options, 'z', -10, 10);
positionFolder.open();
const thrustFolder = gui.addFolder('Thrust');
thrustFolder.add(options, 'w1', 500, 600);
thrustFolder.add(options, 'w2', 500, 600);
thrustFolder.add(options, 'w3', 500, 600);
thrustFolder.add(options, 'w4', 500, 600);

function init_quadcopter() {
    Omega.set(options.omega_x, options.omega_y, options.omega_z);
    V.set(options.v_x, options.v_y, options.v_z);
    Angle.set(options.phi, options.theta, options.psi);
    X.set(options.x, options.y, options.z);
    Thrust.set(options.w1, options.w2, options.w3, options.w4);

    camera.position.set(-1, -1, options.z - 1);
    camera.up.set(0, 0, -1);
    controls.target.set(0, 0, options.z);
    controls.update();
}

// let w_i = 557.142;      // rad/s 當懸停在空中時，螺旋槳產生的拉力與無人機所受到的重力相等。

let F = new THREE.Vector4();
let Omega_dot = new THREE.Vector3();
let V_dot = new THREE.Vector3();
let Omega_modify = new THREE.Vector3();

let Omega = new THREE.Vector3();
let V = new THREE.Vector3();
let Angle = new THREE.Vector3();
let X = new THREE.Vector3();
let Thrust = new THREE.Vector4();
init_quadcopter();

const dt = 0.01;
const clock = new THREE.Clock();
let accumulator = 0;

function animate(now) {
    const delta = clock.getDelta();
    accumulator += delta;
    while( accumulator >= dt) {        
        // torque & force
        F = force(Thrust.x, Thrust.y, Thrust.z, Thrust.w, ModelParam_c_T, ModelParam_c_M,  ModelParam_d);
        
        // omega_dot & v_dot -> omega & v
        Omega_dot = omega_dot(F.x, F.y, F.z, Thrust.x, Thrust.y, Thrust.z, Thrust.w, ModelParam_I_xx, ModelParam_I_yy, ModelParam_I_zz, ModelParam_J_RP, Omega.x, Omega.y, Omega.z);
        V_dot = v_dot(ModelParam_m, ModelParam_g, Angle.x, Angle.y, Angle.z, F.w);  // (m/s**2)

        Omega.set(Omega.x + Omega_dot.x * dt, Omega.y + Omega_dot.y * dt, Omega.z + Omega_dot.z * dt);
        V.set(V.x + V_dot.x * dt, V.y + V_dot.y * dt, V.z + V_dot.z * dt);

        // omega & v -> position & angle
        Omega_modify = omega_modify(Omega.x, Omega.y, Omega.z, Angle.x, Angle.y);
        Angle.set(Angle.x + Omega_modify.x * dt, Angle.y + Omega_modify.y * dt, Angle.z + Omega_modify.z * dt);
        X.set(X.x + V.x * dt, X.y + V.y * dt, X.z + V.z * dt);

        group.rotation.x = Angle.x;
        group.rotation.y = Angle.y;
        group.rotation.z = Angle.z;
        group.position.copy(X);

        controls.update();
    
        accumulator -= dt;
    }
    renderer.render( scene, camera );


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