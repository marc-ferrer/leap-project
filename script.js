'use strict';
const sceneWidth = window.innerWidth;
const sceneHeight = window.innerHeight;
const MAX_DISTANCE = 10000;
const FOV = 55; // Field Of View from bottom to top of view, in degrees

let scene, camera, renderer;
let paused = false;

let cameraX = -500;
let cameraY = 500;
let cameraZ = 500;

let hand = {};

init();
animate();
Leap.loop(animate2);
Leap.loopController.setBackground(true);

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

	// TODO: move to separate function
	// Hand init
  let indexGeometry = new THREE.BoxGeometry(10, 10, 100);
	let thumbGeometry = new THREE.BoxGeometry(10, 10, 60);
	let middleGeometry = new THREE.BoxGeometry(10, 10, 120);
	let ringGeometry = new THREE.BoxGeometry(10, 10, 80);
	let pinkyGeometry = new THREE.BoxGeometry(8, 8, 60);
  material = new THREE.MeshNormalMaterial();
	hand.thumb = new THREE.Mesh(thumbGeometry, material);
  hand.index = new THREE.Mesh(indexGeometry, material);
  hand.middle = new THREE.Mesh(middleGeometry, material);
  hand.ring = new THREE.Mesh(ringGeometry, material);
  hand.pinky = new THREE.Mesh(pinkyGeometry, material);
  scene.add(hand.thumb);
  scene.add(hand.index);
  scene.add(hand.middle);
  scene.add(hand.ring);
  scene.add(hand.pinky);

	camera.lookAt(hand.index.position)
}

window.addEventListener('keydown', onKeyDown, false);

function onKeyDown(e) {
	// Key event test
	if (e.key === 'ArrowDown') {
		hand.index.position.y--;
	}else if (e.key === 'ArrowUp') {
		hand.index.position.y++;
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

let handsPrinted = false;
function animate2(frame) {
	let positions;

	if (frame.hands.length) {
		if (!handsPrinted) {
			console.log('Hands: ', frame.hands);
			handsPrinted = true;
		}
		let fingers = frame.hands[0].fingers;

		// Thumb
		positions = fingers[0].positions;
		hand.thumb.position.fromArray(positions[4]);
		hand.thumb.lookAt(new THREE.Vector3().fromArray(positions[3]));
		// Index
		positions = fingers[1].positions;
		hand.index.position.fromArray(positions[4]);
		hand.index.lookAt(new THREE.Vector3().fromArray(positions[3]));
		// Middle
		positions = fingers[2].positions;
		hand.middle.position.fromArray(positions[4]);
		hand.middle.lookAt(new THREE.Vector3().fromArray(positions[3]));
		// Ring
		positions = fingers[3].positions;
		hand.ring.position.fromArray(positions[4]);
		hand.ring.lookAt(new THREE.Vector3().fromArray(positions[3]));
		// Pinky
		positions = fingers[4].positions;
		hand.pinky.position.fromArray(positions[4]);
		hand.pinky.lookAt(new THREE.Vector3().fromArray(positions[3]));

	}

}

function animate() {

	requestAnimationFrame(animate);
	// controls.update();
	// stats.update();
	renderer.render(scene, camera);

}

// TODO: enable pause feature
function togglePause() {
	let buttonText;

	paused = !paused;
	buttonText = (paused)? 'Resume' : 'Pause';

	document.getElementById('pause-button').innerText = buttonText;
}
