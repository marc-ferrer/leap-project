'use strict';

import {getPosition} from './js/leap-controls.js';
const TweenMax = window.TweenMax;
const Power2 = window.Power2;

const sceneWidth = 800;
const sceneHeight = 600;
// const sceneWidth = window.innerWidth;
// const sceneHeight = window.innerHeight;
const MAX_DISTANCE = 10000;
const FOV = 50; // Field Of View from bottom to top of view, in degrees
const CUBES_INTERVAL = 5000; // ms
let CUBES_VELOCITY = 300;
const CUBES_DISTANCE = MAX_DISTANCE / 2;
const CUBES_HEIGHT = 50;
const CUBES_COLOR = 0x009999;
const roadWidth = 600;

Physijs.scripts.worker = './js/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

class Picker {
	constructor(scene) {
		this.scene = scene;
		this.color = 0x11ff11;
		this.xSize = 120;
		this.ySize = 40;
		this.zSize = 100;
		this.xScale = 1;

		this.geom = new THREE.CubeGeometry(this.xSize, this.ySize, this.zSize);
		this.mat = new THREE.MeshLambertMaterial({color: this.color});
		this.weight = 0;
		this.mesh = new Physijs.BoxMesh(this.geom, this.mat, this.weight);
		this.position = this.mesh.position;

		this.mesh.castShadow = true;
		this.mesh.receiveShadow = false;

		this.mesh.setLinearFactor(new THREE.Vector3(0, 0, 0));
		this.mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
		this.mesh.setAngularFactor(new THREE.Vector3(0, 0, 0));
		this.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));
	}

	addToScene(){
		this.scene.add(this.mesh);
	}

	addEventListener(event, handler){
		this.mesh.addEventListener(event, handler);
	}

	needsUpdate(){
		this.mesh.__dirtyPosition = true;
	}

	shrink() {
		if (this.xScale > 0.2) {
			this.xScale-= 0.2;
			this.mesh.scale.set(this.xScale, 1, 1);
		}
	}
}

class Cube {
	constructor(scene, width, velocity, color){
		this.scene = scene;
		this.width = width;
		this.velocity = velocity;
		this.points = 10;
		this.color = color || 0x888888;

		this.geom = new THREE.CubeGeometry(width, 50, 100);
		this.mat = new THREE.MeshLambertMaterial({color: this.color});
		this.mesh = new Physijs.BoxMesh(this.geom, this.mat);
		this.position = this.mesh.position;
		this.mesh.castShadow = true;
	}

	addToScene(){
		this.scene.add(this.mesh);
	}

	updateVelocity(vel){
		this.mesh.setLinearFactor(new THREE.Vector3(0, 0, vel));
		this.mesh.setLinearVelocity(new THREE.Vector3(0, 0, vel));
	}
}

class EnemyCube extends Cube {
	constructor(scene, width, velocity){
		super(scene, width, velocity, 0xf25346);
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
		this.level = 0;
		this.score = 0;

		this.container = document.getElementById('game-container');
		this.scoreText = document.getElementById('score-text');

		this.cubesInterval = CUBES_INTERVAL;
		this.maxCubesInterval = 500;
		this.cubesIntervalStep = 400;
		this.velocity = CUBES_VELOCITY;
		this.maxVelocity = CUBES_VELOCITY * 15;
		this.velocityStep = 100;
		this.cubesColor = CUBES_COLOR;
		this.cubesWidth = 100;
		this.minCubesWidth = 20;
		this.cubesWidthStep = 20;
		this.cubesHeight = CUBES_HEIGHT;
		this.cubesDist = CUBES_DISTANCE;
		this.cubesXScale = 1;
		this.enemiesInterval = this.cubesInterval * 5;
		this.enemiesColor = '';
		this.enemiesWidth = 80;
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
		this.picker = new Picker(this.scene);
		this.picker.position.y = CUBES_HEIGHT;
		this.picker.position.z = 300;
		this.picker.addToScene();
		this.picker.addEventListener('collision', this.onCubePicked.bind(this));

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

		// TODO: Remove when axis helper is not needed
		// let axisHelper = new THREE.AxisHelper(300);
		// scene.add(axisHelper);

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
			this.scene, this.cubesWidth, this.velocity, this.cubesColor);
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
			this.scene, this.enemiesWidth, this.velocity, this.cubesColor);
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

	animate(tFrame) {
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
		requestAnimationFrame(this.animate.bind(this));
		this.scene.simulate();
		this.renderer.render(this.scene, this.camera);
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
			}
			if (this.score % 100 === 0) {
				this.shrinkCubes();
			}
			this.velocity = Math.min(
				this.velocity + this.velocityStep, this.maxVelocity);
		}
		this.cubesMap.delete(cubeMesh);
	}
}

const roadGame = new Game();

roadGame.init();
roadGame.animate(roadGame.tCube);
