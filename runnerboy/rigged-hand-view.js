'use strict';
const sceneWidth = 640;
const sceneHeight = 480;
const MAX_DISTANCE = 10000;
const FOV = 55; // Field Of View from bottom to top of view, in degrees

let scene, camera, renderer;

let paused = false;

let cameraX = -500;
let cameraY = 500;
let cameraZ = 500;

// STATS
const stats = new Stats();

stats.domElement.style.position = 'absolute';

stats.domElement.style.left = '0px';

stats.domElement.style.top = '0px';

document.body.appendChild(stats.domElement);
// ----------------------------------------- //

init();
// animate();
// const controller = Leap.loop(animate);
const controller = new Leap.Controller();
window.controller = controller;
// Leap.loopController.setBackground(true);
controller.use('handHold').use('transform', {
	position: new THREE.Vector3(1, 0, 0)
}).use('handEntry').use('screenPosition').use('riggedHand', {
	parent: scene,
	renderer: renderer,
	// scale: getParam('scale'),
	// positionScale: getParam('positionScale'),
	helper: true,
	offset: new THREE.Vector3(0, 0, 0),
	renderFn: function() {
		renderer.render(scene, camera);
		// return controls.update();
	},
	// materialOptions: {
	// 	wireframe: getParam('wireframe')
	// },
	// dotsMode: getParam('dots'),
	stats: stats,
	camera: camera,
	boneLabels: function(boneMesh, leapHand) {
		if (boneMesh.name.indexOf('Finger_03') === 0) {
			return leapHand.pinchStrength;
		}
	},
	boneColors: function(boneMesh, leapHand) {
		if ((boneMesh.name.indexOf('Finger_0') === 0) || (boneMesh.name.indexOf('Finger_1') === 0)) {
			return {
				hue: 0.6,
				saturation: leapHand.pinchStrength
			};
		}
	},
	checkWebGL: true
}).connect();
function init() {
	let geometry, material;

	// TODO: Move to separate function
	// Scene init
	renderer = new THREE.WebGLRenderer({
		alpha: 1,
		antialias: true
	});
	renderer.setSize(sceneWidth, sceneHeight);
	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);

	camera = new THREE.PerspectiveCamera(FOV, sceneWidth / sceneHeight, 1, MAX_DISTANCE);
	camera.position.set(cameraX, cameraY, cameraZ);

	scene = new THREE.Scene();

	let axisHelper = new THREE.AxisHelper(150);
	scene.add(axisHelper);

	let gridHelper = new THREE.GridHelper(150, 10);
	gridHelper.position.set(0, 1, 0);
	scene.add(gridHelper);

	camera.lookAt(new THREE.Vector3( ));
}

function onWindowResize() {
	camera.aspect = sceneWidth / sceneHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(sceneWidth, sceneHeight);
}

let handsPrinted = false;
function animate2(frame) {
	let positions;

	if (frame.hands.length) {
		if (!handsPrinted) {
			console.log('Hands: ', frame.hands);
			handsPrinted = true;
		}
	}
}

function onFrame(frame) {
	// TODO: Program frame filtering here
}

controller.on('frame', onFrame);

/*function animate() {
	requestAnimationFrame(animate);
	// controls.update();
	// stats.update();
	renderer.render(scene, camera);
}*/

// TODO: enable pause feature
function togglePause() {
	let buttonText;

	paused = !paused;
	buttonText = (paused)? 'Resume' : 'Pause';

	document.getElementById('pause-button').innerText = buttonText;
}

controller.on('gesture', onGesture);
function onGesture(gesture,frame){
	// console.log(gesture.type + " with ID " + gesture.id + " in frame " + frame.id);
}