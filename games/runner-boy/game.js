import {StarRewards, ObstaclesGroup} from './js/rewards.js'

const WIDTH = 640;
const HEIGHT = 480;
const GRAVITY = 500;
const STARS_INTERVAL = 8;

let game;

class PhaserGame {

  static padScore(score) {
    let textScore = '0' + score;

    if (textScore.length > 3) {
      textScore = textScore.substr(1);
    }
    return textScore;
  }

  constructor() {
    this.width = WIDTH;
    this.height = HEIGHT;
    this.score = 0;
    this.player = null;
    this.platforms = [];
    this.stars = [];
    this.cursors = null;

    this.speed = 150;
    this.gravity = GRAVITY;
    this.lastCatchedStar = null;
  }

  resetGame() {
    this.score = 0;
    this.speed = 150;
    this.gravity = GRAVITY;
    this.lastCatchedStar = null;
  }

  init() {
    this.world.resize(WIDTH * 2, HEIGHT);
    this.resetGame();
    let self = this;
    console.log('INIT state called');
    this.state.add('Over', {
      create: function() {
        this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        const label = game.add.text(
          WIDTH / 2, HEIGHT / 2, 'Score: '+self.score+'\nGAME OVER\nPress SPACE to restart',
          { font: '22px Lucida Console', fill: '#fff', align: 'center'});
        label.anchor.setTo(0.5, 0.5);
      },
      update: function() {
        this.score = 0;
        if (this.spacebar.isDown)
          game.state.start('Game');
      }
    }, false);
  }

  preload () {
    // Load game assets here
    this.load.image('sky', 'assets/sky.png');
    this.load.image('trees', 'assets/trees-h.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('littleStar', 'assets/little-star.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.spritesheet('dude', 'assets/dude.png', 32, 48);

    this.load.bitmapFont(
      'rolling', 'assets/rolling-thunder.png', 'assets/rolling-thunder.xml');
  }

  create () {
    console.log('Create stage called');
    //  We're going to be using physics, so enable the Arcade Physics system
    this.physics.startSystem(Phaser.Physics.ARCADE);

    // Add background graphics
    this.add.sprite(0, 0, 'sky');
    // this.add.sprite(0, 0, 'star');

    this.background = this.add.tileSprite(
      0, 0, WIDTH, HEIGHT, 'sky');
    // this.background.fixedToCamera = true;

    this.trees = this.add.tileSprite(
      0, this.world.height - 180, WIDTH, 116, 'trees');
    // this.trees.fixedToCamera = true;
    this.trees.autoScroll(-50, 0);

    //  The platforms group contains the ground and the 2 ledges we can jump on
    this.platforms = this.add.group();

    this.stars = new StarRewards(this);
    this.obstacles = new ObstaclesGroup(this, 'tree');

    this.stars.playerCollision.add(this.onPlayerCollision, this);
    this.obstacles.playerCollision.add(this.onObstacleCollision, this);
    //  Enable physics for objects created in this group
    this.platforms.enableBody = true;
    // Here we create the ground.
    let ground = this.platforms.create(
      0, this.world.height - 64, 'ground');
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);
    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;
    ground.fixedToCamera = true;

    this.add.bitmapText(WIDTH - 170, 5, 'rolling', 'Score: ', 18);
    this.scoreText = this.add.bitmapText(WIDTH - 60, 5, 'rolling', '000', 18);

    //---------------------------------------------------//
    //--------------------- PLAYER ----------------------//
    //---------------------------------------------------//

    // The player and its settings
    this.player = this.add.sprite(32, this.world.height - 150, 'dude');

    //  We need to enable physics on the player
    this.physics.arcade.enable(this.player);

    //  Player physics properties. Give the little guy a slight bounce.
    this.player.body.bounce.y = 0.2;
    this.player.body.gravity.y = this.gravity;
    this.player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);
    this.camera.follow(this.player);

    //  Our controls.
    this.cursors = this.input.keyboard.createCursorKeys();

    this.enableHandControlls();

    this.starsSequence();
    this.stars.addReward(WIDTH + 50, 300);

    this.obstaclesSequence();

    this.rewardparticles = this.add.emitter(0, 0, 50);
    this.rewardparticles.makeParticles('littleStar');
    this.rewardparticles.gravity = 50;
  }

  update() {
    // Scroll background
    // this.trees.tilePosition.x = -(this.camera.x * 0.9);

    this.player.play('right');

    let hitPlatform = this.physics.arcade.collide(this.player, this.platforms);
    //  Allow the player to jump if they are touching the ground.
    if (this.cursors.up.isDown && this.player.body.touching.down &&
      hitPlatform){
      this.player.body.velocity.y = -350;
    }
  }

  enableHandControlls() {
    window.addEventListener('handUp', () => {
      console.log('Hand Up event received');
      // let hitPlatform = this.physics.arcade.collide(this.player, this.platforms);
      // TODO: hitPlatform is never evaluated as true here, why?
      if (this.player.body.touching.down) {
        this.player.body.velocity.y = -350;
      }
    });

    window.addEventListener('handDown', () => {
      console.log('Hand down event received');
      this.player.body.velocity.x = 0;
    });
  }

  starsSequence() {
    //  Set-up a simple repeating timer
    // game.time.events.repeat(Phaser.Timer.SECOND, 20, resurrect, this);
    this.starsTimer = this.time.events
      .loop(Phaser.Timer.SECOND * STARS_INTERVAL, () => {
        this.lastCatchedStar = null;
        this.stars.addReward(WIDTH + 50, 300);
      }, this);
  }

  obstaclesSequence(){
    this.obstaclesTimer = this.time.events
      .loop(Phaser.Timer.SECOND * STARS_INTERVAL * 1, () => {
        this.obstacles.addObstacle(WIDTH, this.height - 120);
      }, this);
  }

  burstParticles(position){
    //  Position the emitter where the mouse/touch event was
    this.rewardparticles.x = position.x;
    this.rewardparticles.y = position.y;
    this.rewardparticles.start(true, 1300, null, 10);
  }

  onPlayerCollision(star) {
    if (isNaN(this.player.body.velocity.y)) {
      this.player.body.velocity.y = -240;
    }
    if (this.player.body.position.y < 255) {
      this.player.body.velocity.y = 10;
    }
    if (star !== this.lastCatchedStar) {
      this.burstParticles(star.body.position);
      this.score+= 10;
      this.scoreText.text = PhaserGame.padScore(this.score);
      this.lastCatchedStar = star;
    }
  }

  onObstacleCollision(obstacle){
    console.log('Player collided with an obstacle', obstacle);
    // maybe we should end the leap control streaming session and start again
    this.state.start('Over');
  }
}

window.onload = () => {
  game = new Phaser.Game(
    WIDTH, HEIGHT, Phaser.AUTO, ''
  );

  game.state.add('Game', PhaserGame, true);
}
