'use strict';

import {getPosition} from './js/leap-controls.js';
const TweenMax = window.TweenMax;
const Power2 = window.Power2;

const sceneWidth = 800;
const sceneHeight = 600;
// const sceneWidth = window.innerWidth;
// const sceneHeight = window.innerHeight;
const INITIAL_LIFES = 1;
const INITIAL_SCORE = 0;
const INITIAL_LEVEL = 0;
const MAX_DISTANCE = 10000;
const PICKER_Z_POSITION = 300;
const FOV = 50; // Field Of View from bottom to top of view, in degrees
const CUBES_INTERVAL = 5000; // ms
let CUBES_VELOCITY = 300;
const CUBES_DISTANCE = MAX_DISTANCE / 2;
const CUBES_HEIGHT = 50;
const CUBES_COLOR = 0x009999;
const roadWidth = 600;

Physijs.scripts.worker = './js/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

class Cube {
	constructor(scene, size, weight, velocity, color){
		this.scene = scene;
		this.weight = weight;
		this.velocity = velocity;
		this.points = 10;
		this.color = color || 0x888888;
		if (isNaN(size)) {
			this.width = size[0];
			this.height = size[1];
			this.depth = size[2];
		}else {
			this.width = size;
			this.height = size;
			this.depth = size;
		}

		this.geometry = new THREE.CubeGeometry(this.width, this.height, this.depth);
		this.material = new THREE.MeshLambertMaterial({color: this.color});
		this.mesh = new Physijs.BoxMesh(this.geometry, this.material, this.weight);
		this.position = this.mesh.position;
		this.mesh.castShadow = true;
	}

	addToScene(){
		this.scene.add(this.mesh);
	}

	needsUpdate(){
		this.mesh.__dirtyPosition = true;
	}

	updateVelocity(vel){
		this.mesh.setLinearFactor(new THREE.Vector3(0, 0, vel));
		this.mesh.setLinearVelocity(new THREE.Vector3(0, 0, vel));
	}
}

class Picker extends Cube{
	constructor(scene) {
		super(scene, [120, 40, 100], 0, 0, 0x11ff11);
		this.mesh.receiveShadow = false;

		this.mesh.setLinearFactor(new THREE.Vector3(0, 0, 0));
		this.mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
		this.mesh.setAngularFactor(new THREE.Vector3(0, 0, 0));
		this.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));
	}

	addEventListener(event, handler){
		this.mesh.addEventListener(event, handler);
	}

	reset() {
		this.mesh.setLinearFactor(new THREE.Vector3(0, 0, 0));
		this.mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
		this.mesh.setAngularFactor(new THREE.Vector3(0, 0, 0));
		this.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));

		this.xScale = 1;
		this.mesh.scale.set(1, 1, 1);
	}

	shrink() {
		if (this.xScale > 0.2) {
			this.xScale-= 0.2;
			this.mesh.scale.set(this.xScale, 1, 1);
		}
	}
}

class EnemyCube extends Cube {
	constructor(scene, size, velocity){
		super(scene, size, 1, velocity, 0xf25346);
	}
}

class Particle{
	constructor() {
		this.geom = new THREE.TetrahedronGeometry(50, 0);
		this.mat = new THREE.MeshPhongMaterial({
			color:0x009999,
			shininess:0,
			specular:0xffffff,
			shading:THREE.FlatShading
		});
		this.mesh = new THREE.Mesh(this.geom, this.mat);
	}

	explode(pos, color, scale){
		const _this = this;
		const _p = this.mesh.parent;
		this.mesh.material.color = new THREE.Color( color);
		this.mesh.material.needsUpdate = true;
		this.mesh.scale.set(scale, scale, scale);
		const targetX = pos.x + (-1 + Math.random() * 2) * 50;
		const targetY = pos.y + (-1 + Math.random() * 2) * 50;
		const speed = .6 + Math.random() * .2;
		TweenMax.to(
			this.mesh.rotation, speed, {
				x: Math.random() * 12,
				y: Math.random() * 12
			});
		TweenMax.to(
			this.mesh.scale, speed, {
				x:.1,
				y:.1,
				z:.1
			});
		TweenMax.to(
			this.mesh.position,
			speed,
			{
				x: targetX,
				y: targetY,
				delay: Math.random() *.1,
				ease: Power2.easeOut,
				onComplete: function(){
					if(_p) _p.remove(_this.mesh);
					_this.mesh.scale.set(1, 1, 1);
					// particlesPool.unshift(_this);
				}
			});
	}
}

class ParticlesHolder{
	constructor() {
		this.mesh = new THREE.Object3D();
		this.particlesInUse = [];
		this.particlesPool = [];
	}

	spawnParticles(pos, density, color, scale){
		const nPArticles = density;
		for (let i=0; i<nPArticles; i++){
			let particle;
			if (this.particlesPool.length) {
				particle = this.particlesPool.pop();
			}else{
				particle = new Particle();
			}
			this.mesh.add(particle.mesh);
			particle.mesh.visible = true;
			particle.mesh.position.y = pos.y;
			particle.mesh.position.x = pos.x;
			particle.mesh.position.z = pos.z;
			particle.explode(pos, color, scale);
		}
	}
}

class Game {
	constructor(){
		this.level = INITIAL_LEVEL;
		this.score = INITIAL_SCORE;
		this.lives = INITIAL_LIFES;

		this.container = document.getElementById('game-container');
		this.scoreText = document.getElementById('score-text');
		this.gameOverBox = document.getElementById('game-over-box');
		this.replayMessage = document.getElementById('replay-message');
		this.scoreMessage = document.getElementById('score-message');

		this.cubesInterval = CUBES_INTERVAL;
		this.maxCubesInterval = 500;
		this.cubesIntervalStep = 600;
		this.velocity = CUBES_VELOCITY;
		this.maxVelocity = CUBES_VELOCITY * 15;
		this.velocityStep = 100;
		this.cubesColor = CUBES_COLOR;
		this.cubesWidth = 100;
		this.cubesHeight = 50;
		this.cubesDepth = 100;
		this.minCubesWidth = 20;
		this.cubesWidthStep = 20;
		this.cubesHeight = CUBES_HEIGHT;
		this.cubesDist = CUBES_DISTANCE;
		this.cubesXScale = 1;
		this.enemiesInterval = this.cubesInterval * 5;
		this.enemiesColor = '';
		this.enemiesWidth = 80;
		this.enemiesHeight = 50;
		this.enemiesDepth = 100;
		this.scene = null;
		this.renderer = null;
		this.camera = null;
		this.picker = null;
		this.cubesMap = new Map();

		this.wallsColor = 0xcccccc;
		this.roadColor = 0xeeeeee;
		this.roadLength = 1500;
		this.roadWidth = 600;
	}

	reset(){
		this.state = 'Playing';
		this.level = INITIAL_LEVEL;
		this.score = INITIAL_SCORE;
		this.lives = INITIAL_LIFES;

		this.cubesInterval = CUBES_INTERVAL;
		this.velocity = CUBES_VELOCITY;
		this.cubesWidth = 100;
		this.cubesHeight = 50;
		this.cubesDepth = 100;
		this.cubesHeight = CUBES_HEIGHT;
		this.cubesDist = CUBES_DISTANCE;
		this.cubesXScale = 1;
		this.enemiesInterval = this.cubesInterval * 5;
		this.enemiesColor = '';
		this.enemiesWidth = 80;
		this.enemiesHeight = 50;
		this.enemiesDepth = 100;
		if (this.cubesMap && this.cubesMap.size > 0) {
			this.cubesMap.forEach(c => {
				this.scene.remove(c.mesh);
			});
		}
		this.cubesMap = new Map();
	}

	addSkyBox() {
		const boxSize = MAX_DISTANCE;
		const imagePrefix = './images/skybox-';
		const directions  = ['right', 'left', 'up', 'down', 'back', 'front'];
		const imageSuffix = '.png';
		const skyGeometry = new THREE.CubeGeometry(boxSize, boxSize, boxSize);

		const materialArray = [];
		const textureLoader = new THREE.TextureLoader();
		for (let i = 0; i < 6; i++){
			materialArray.push( new THREE.MeshBasicMaterial({
				// map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
				map: textureLoader.load(imagePrefix + directions[i] + imageSuffix),
				side: THREE.BackSide
			}));
		}
		const skyMaterial = new THREE.MeshFaceMaterial(materialArray);
		const skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
		this.scene.add(skyBox);
	}

	addRoad(roadLength, roadWidth) {
		const roadMat = new THREE.MeshStandardMaterial({color: this.roadColor});
		// create the plane geometry
		const geometry = new THREE.PlaneGeometry(roadWidth, roadLength * 8);
		const road = new THREE.Mesh(geometry, roadMat);
		road.rotation.x = -Math.PI/2;
		road.position.y = -2;
		road.position.z = -roadLength * 3
		road.doubleSided = true;
		road.receiveShadow = true;
		road.castShadow = false;

		this.scene.add(road);
	}

	addWalls(length, height){
		const wallMat = new THREE.MeshBasicMaterial({color: this.wallsColor});
		// create the plane geometry
		const geometry = new THREE.PlaneGeometry(height, length);

		// create the ground form the geometry and material
		const lWall = new THREE.Mesh(geometry, wallMat);
		lWall.rotation.z = -Math.PI / 2;
		lWall.rotation.y = Math.PI / 2;
		lWall.position.y = (height / 2) - 5;
		lWall.position.x = -roadWidth / 2;
		lWall.doubleSided = true;
		this.scene.add(lWall);

		const rWall = new THREE.Mesh(geometry, wallMat);
		rWall.rotation.y = -Math.PI / 2;
		rWall.rotation.z = -Math.PI / 2;
		rWall.position.x = roadWidth / 2;
		rWall.position.y = (height / 2) - 5;
		rWall.doubleSided = true;
		this.scene.add(rWall);
	}

	// eslint-disable-next-line no-unused-vars
	onCubePicked(cubeMesh, relVelocity, relRotation, contactNormal){
		this.particlesHolder.spawnParticles(
			cubeMesh.position.clone(), 10, cubeMesh.material.color, .8);
		this.scene.remove(cubeMesh);
		if (this.cubesMap.get(cubeMesh) instanceof EnemyCube) {
			this.picker.shrink();
		}else {
			this.score += 10;
			this.scoreText.innerHTML = `score ${this.score}`;
			this.level = Math.floor(this.score / 50);
			if (this.score % 50 === 0) {
				// set up a minimum interval for cubes
				this.cubesInterval = Math.max(
					this.cubesInterval - this.cubesIntervalStep, this.maxCubesInterval);
				this.velocity = Math.min(
					this.velocity + this.velocityStep, this.maxVelocity);
			}
			if (this.score % 100 === 0) {
				this.shrinkCubes();
			}
		}
		this.cubesMap.delete(cubeMesh);
	}

	initPicker() {
		this.picker = new Picker(this.scene);
		this.picker.position.y = CUBES_HEIGHT;
		this.picker.position.z = PICKER_Z_POSITION;
		this.picker.addToScene();
		this.picker.addEventListener('collision', this.onCubePicked.bind(this));
	}

	init() {
		this.scene = new Physijs.Scene;
		this.scene.setGravity(new THREE.Vector3(0, 0, 0));

		// OrthographicCamera / PerspectiveCamera
		this.camera = new THREE.PerspectiveCamera(
			FOV, sceneWidth / sceneHeight, 1, MAX_DISTANCE);
		this.camera.position.z = 900;
		this.camera.position.y = 180;

		this.scoreText.innerHTML = `score ${this.score}`;

		// Sky box
		this.addSkyBox(this.scene);
		this.scene.fog = new THREE.FogExp2(0x9999ff, 0.00010);
		this.particlesHolder = new ParticlesHolder();

		// Road & Walls
		this.addRoad(this.roadLength, this.roadWidth);
		this.addWalls(MAX_DISTANCE, 120);

		// Picker
		this.initPicker();

		// Lights
		this.light = new THREE.SpotLight(0xffffff);
		this.light.position.set(0, 400, 500);
		this.light.castShadow = true;
		this.light.intensity = 0.6;
		this.scene.add(this.light);
		this.ambientLight = new THREE.AmbientLight(0x999999);
		this.scene.add(this.ambientLight);

		//Set up shadow properties for the light
		this.light.shadow.mapSize.width = 512;  // default
		this.light.shadow.mapSize.height = 512; // default
		this.light.shadow.camera.near = 0.5;       // default
		this.light.shadow.camera.far = 500      // default

		this.renderer = new THREE.WebGLRenderer({
			alpha: 1,
			antialias: true
		});
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setSize(sceneWidth, sceneHeight);

		this.container.appendChild(this.renderer.domElement);

		this.scene.add(this.particlesHolder.mesh);

		this.camera.lookAt(this.picker.position);

		this.state = 'Playing';
		this.tCube = performance.now();
		this.tEnemy = performance.now();
	}

	addCube(){
		let xPos = Math.floor(
			Math.random() * ((roadWidth / 2) - this.cubesWidth / 2)) + 1;
		if(Math.random() > 0.5){
			xPos = -xPos;
		}
		const cube = new Cube(
			this.scene, [this.cubesWidth, this.cubesHeight, this.cubesDepth],
			1, this.velocity, this.cubesColor);
		cube.position.set(xPos, this.cubesHeight, -this.cubesDist);
		this.cubesMap.set(cube.mesh, cube);
		cube.addToScene();
		cube.updateVelocity(this.velocity);
	}

	addEnemy() {
		let xPos = Math.floor(
			Math.random() * ((roadWidth / 2) - this.enemiesWidth / 2)) + 1;
		if(Math.random() > 0.5){
			xPos = -xPos;
		}
		const enemy = new EnemyCube(
			this.scene, [this.enemiesWidth, this.enemiesHeight, this.enemiesDepth],
			1, this.velocity);
		enemy.position.set(xPos, this.cubesHeight, -this.cubesDist);
		this.cubesMap.set(enemy.mesh, enemy);
		enemy.addToScene();
		enemy.updateVelocity(this.velocity);
	}

	shrinkCubes() {
		if (this.cubesWidth > this.minCubesWidth) {
			this.cubesWidth-= this.cubesWidthStep;
		}
	}

	handleReplay(key) {
		if (this.state !== 'Over') {
			return;
		}
		if (key.keyCode === 27) { // escape
			// Removes the event listener, because this function finally calls animate
			// should we not remove the listener, multiple animate loops would be created
			document.removeEventListener('keyup', this.handleReplay);
			this.gameOverBox.style.display = 'none';
			this.reset();
			this.picker.reset();
			this.animate(performance.now());
		}
	}

	gameOver() {
		this.state = 'Over';
		this.gameOverBox.style.display = 'block';
		document.addEventListener('keyup', this.handleReplay.bind(this));
	}

	handleMisses() {
		this.cubesMap.forEach((c, key) => {
			if (c.position.z > this.camera.position.z) {
				this.scene.remove(c.mesh);
				this.cubesMap.delete(key);
				if (!(c instanceof EnemyCube)) {
					this.lives--;
				}
			}
		});
		if (this.lives <= 0) {
			this.gameOver();
		}
	}

	animate(tFrame) {
		if (this.state === 'Playing') {
			requestAnimationFrame(this.animate.bind(this));
		}
		const pickerXPos = getPosition((-roadWidth / 2) + 75, (roadWidth / 2) - 75);
		if (pickerXPos) {
			this.picker.position.x = pickerXPos;
			this.picker.needsUpdate();
		}
		if (tFrame - this.tCube > this.cubesInterval){
			if (tFrame - this.tEnemy > this.enemiesInterval) {
				this.tEnemy = tFrame;
				this.tCube = tFrame;
				this.addEnemy();
			}else {
				this.tCube = tFrame;
				this.addCube();
			}
		}
		this.handleMisses();
		this.scene.simulate();
		this.renderer.render(this.scene, this.camera);
	}
}

const roadGame = new Game();

roadGame.init();
roadGame.animate(roadGame.tCube);
