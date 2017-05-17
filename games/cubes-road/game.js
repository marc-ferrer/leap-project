'use strict';

import {getPosition} from './js/leap-controls.js'

const sceneWidth = 800;
const sceneHeight = 600;
// const sceneWidth = window.innerWidth;
// const sceneHeight = window.innerHeight;
const MAX_DISTANCE = 8000;
const FOV = 50; // Field Of View from bottom to top of view, in degrees
const CUBES_INTERVAL = 5000; // ms
const CUBES_VELOCITY = 200;
const CUBES_DISTANCE = 1500;
const CUBES_HEIGHT = 60;
const container = document.getElementById('game-container');
const roadLength = 1500;
const roadWidth = 600;

let scene;
let camera;
let renderer;
let floor = [];
const cubes = [];
let picker;

// STATS
const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.bottom = '0';
stats.domElement.style.top = null;
stats.domElement.style.zIndex = 100;
container.appendChild(stats.domElement);

Physijs.scripts.worker = './js/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

function addGround(groundLength, groundWidth){
	// create the ground material
	// every groundLengthpx on the z axis, add a bit of ground
	const groundColors = [0x111111, 0xfdfdfd, 0x111111];
	for (let z = 0; z < 3; z++){
		const groundMat = new THREE.MeshBasicMaterial({color: groundColors[z]});
		// create the plane geometry
		const geometry = new THREE.PlaneGeometry(groundWidth, groundLength);

		// create the ground form the geometry and material
		const ground = new THREE.Mesh(geometry, groundMat);
		ground.rotation.x = -Math.PI/2;
		ground.position.y = -2; // lower it
		//  Then set the z position to where it is in the loop (distance of camera)
		ground.position.z = -z * groundLength;
		ground.doubleSided = true;
		// add the ground to the scene
		scene.add(ground);
		floor.push(ground);
	}
}

function addWalls(length, height){
	const wallMat = new THREE.MeshBasicMaterial({color: 0xcccccc});
	// create the plane geometry
	const geometry = new THREE.PlaneGeometry(height, length);

	// create the ground form the geometry and material
	const lWall = new THREE.Mesh(geometry, wallMat);
	lWall.rotation.z = -Math.PI / 2;
	lWall.rotation.y = Math.PI / 2;
	lWall.position.y = (height / 2) - 5;
	lWall.position.x = -roadWidth / 2;
	lWall.doubleSided = true;
	scene.add(lWall);

	const rWall = new THREE.Mesh(geometry, wallMat);
	rWall.rotation.y = -Math.PI / 2;
	rWall.rotation.z = -Math.PI / 2;
	rWall.position.x = roadWidth / 2;
	rWall.position.y = (height / 2) - 5;
	rWall.doubleSided = true;
	scene.add(rWall);
}

function animateGrounds() {
	for(let i=0; i < floor.length; i++) {
    const ground = floor[i];

    // move it forward by a 10th of its array position each time
    ground.position.z+=  1;

		if((ground.position.z - roadLength / 2) > camera.position.z){
			ground.position.z-= roadLength * 3;
		}
  }
}

// eslint-disable-next-line no-unused-vars
function onCubePicked(cube, relVelocity, relRotation, contactNormal){
	console.log('Cube picked!!!', cube);
	// TODO: Add cube explosion / particles
	scene.remove(cube);

	const index = cubes.findIndex(c => {
		return c === cube;
	});

	cubes.splice(index, 1);
}

function init() {
	// scene = new THREE.Scene();
	scene = new Physijs.Scene;
	// scene.setGravity(new THREE.Vector3(0, 0, 10));
	scene.setGravity(new THREE.Vector3(0, 0, 0));

	camera = new THREE.PerspectiveCamera(
		FOV, sceneWidth / sceneHeight, 1, MAX_DISTANCE);
	camera.position.z = 1000;
	camera.position.y = 250;

	addGround(roadLength, roadWidth);
	addWalls(roadLength * 5, 150);

	picker = new Physijs.BoxMesh(
		new THREE.CubeGeometry(150, 50, 100),
		new THREE.MeshBasicMaterial({ color: 0x11ff11 }),
		0
	);
	picker.setLinearFactor(new THREE.Vector3(0, 0, 0));
	picker.setLinearVelocity(new THREE.Vector3(0, 0, 0));
	picker.setAngularFactor(new THREE.Vector3(0, 0, 0));
	picker.setAngularVelocity(new THREE.Vector3(0, 0, 0));
	picker.position.y = CUBES_HEIGHT;
	picker.position.z = 300;
	scene.add(picker);
	picker.addEventListener('collision', onCubePicked);

	let axisHelper = new THREE.AxisHelper(300);
	scene.add(axisHelper);

	let gridHelper = new THREE.GridHelper(600, 10);
	gridHelper.position.set(0, 1, 0);
	scene.add(gridHelper);

	renderer = new THREE.WebGLRenderer({
		alpha: 1,
		antialias: true
	});
	renderer.setSize(sceneWidth, sceneHeight);

	container.appendChild(renderer.domElement);

	camera.lookAt(picker.position);
}

function addCube(distance, height){
	const cubeWidth = 100;
	let xPos = Math.floor(Math.random() * ((roadWidth / 2) - cubeWidth / 2)) + 1;
	if(Math.random() > 0.5){
		xPos = -xPos;
	}

	const box = new Physijs.BoxMesh(
		new THREE.CubeGeometry(cubeWidth, 50, 100),
		new THREE.MeshBasicMaterial({ color: 0x888888 }));

	box.position.set(xPos, height, -distance);
	cubes.push(box);
	scene.add(box);
	box.setLinearFactor(new THREE.Vector3(0, 0, CUBES_VELOCITY));
	box.setLinearVelocity(new THREE.Vector3(0, 0, CUBES_VELOCITY));
	return box;
}

let tCube = performance.now();
function animate(tFrame) {
	const pickerXPos = getPosition((-roadWidth / 2) + 75, (roadWidth / 2) - 75);
	if (pickerXPos) {
		// console.log('Picker position:', pickerXPos);
		picker.position.x = pickerXPos;
		picker.__dirtyPosition = true;
	}
	if (tFrame - tCube > CUBES_INTERVAL){
		tCube = tFrame;
		addCube(CUBES_DISTANCE, CUBES_HEIGHT);
	}
	requestAnimationFrame(animate);
	scene.simulate();
	animateGrounds();
	stats.update();
	renderer.render(scene, camera);
}

init();
animate(tCube);
