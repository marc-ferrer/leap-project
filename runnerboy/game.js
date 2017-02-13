const WIDTH = 640;
const HEIGHT = 480;
const GAME_CONTAINER_ID = 'runner-window';

let game;
let player;
let platforms;
let cursors;

function preload () {
  // Load game assets here
  game.load.image('logo', 'assets/phaser.png');
  game.load.image('sky', 'assets/sky.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('star', 'assets/star.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
}

function create () {
  // let logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
  // logo.anchor.setTo(0.5, 0.5);

  //  We're going to be using physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);

  // Add background graphics
  game.add.sprite(0, 0, 'sky');
  game.add.sprite(0, 0, 'star');

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = game.add.group();
  //  Enable physics for objects created in this group
  platforms.enableBody = true;
  // Here we create the ground.
  let ground = platforms.create(
    0, game.world.height - 64, 'ground');
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);
    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    let ledge = platforms.create(300, 300, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-120, 180, 'ground');
    ledge.body.immovable = true;

    //---------------------------------------------------//
    //--------------------- PLAYER ----------------------//
    //---------------------------------------------------//

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
  }

  function update() {
    //  Collide the player and the stars with the platforms
    let hitPlatform = game.physics.arcade.collide(player, platforms);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown){
      //  Move to the left
      player.body.velocity.x = -150;
      player.animations.play('left');
    }else if (cursors.right.isDown){
      //  Move to the right
      player.body.velocity.x = 150;
      player.animations.play('right');
    } else{
      //  Stand still
      player.animations.stop();
      player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down && hitPlatform){
      player.body.velocity.y = -350;
    }
  }

  window.onload = function() {
    game = new Phaser.Game(
      WIDTH, HEIGHT, Phaser.AUTO, '',
      { preload: preload, create: create, update: update });
    };
