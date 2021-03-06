import Phaser from 'phaser'

export class Star extends Phaser.Sprite{
  constructor(game, x, y) {
    let nx = x || 0;
    let ny = y || 0;

    super(game, nx, ny, 'star');
    this.sprite = 'star';
    this.playerCollision = new Phaser.Signal();

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    this.exists = false;
  }

  move(x, y, angle, speed) {
    this.reset(x, y);
    this.body.mass = 0;

    this.game.physics.arcade.velocityFromAngle(
      angle, -speed, this.body.velocity);

    this.angle = angle;
  }

  stop() {
    this.game.physics.arcade.velocityFromAngle(
      this.angle, 0, this.body.velocity);
    this.reset(850, 300);
    this.kill();
  }

  update() {
    const starHit = this.game.physics.arcade.collide(this.game.player, this);

    if (starHit) {
      // TODO: avoid dispathing the event more than once per star
      this.playerCollision.dispatch(this);
      this.stop();
    }
  }
}

export class StarRewards extends Phaser.Group{
  constructor(game) {
    super(game, game.world, 'star group', false, true, Phaser.Physics.ARCADE);
    // this.create(300, 350, 'star');
    // this.add(new Star(game, 300, 350));

    this.speed = 150;
    this.angle = 0;
    this.playerCollision = new Phaser.Signal();

    for (let i = 0; i < 10; i++) {
      const s = new Star(game);
      s.playerCollision.add(this.onPlayerCollision, this);
      this.add(s, true);
    }

  }

  addReward(x, y) {
    this.getFirstExists(false).move(x, y, this.angle, this.speed);
  }

  onPlayerCollision(star) {
    this.playerCollision.dispatch(star);
  }
}

export class Obstacle extends Phaser.Sprite {
  constructor(game, x, y, sprite) {
    let nx = x || 0;
    let ny = y || 0;

    super(game, nx, ny, sprite);
    this.sprite = sprite;
    this.playerCollision = new Phaser.Signal();

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    this.scale.set(0.5);

    this.exists = false;
  }

  move(x, y, angle, speed) {
    this.reset(x, y);
    this.body.mass = 0;

    this.game.physics.arcade.velocityFromAngle(
      angle, -speed, this.body.velocity);

    this.angle = angle;
  }

  stop() {
    this.game.physics.arcade.velocityFromAngle(
      this.angle, 0, this.body.velocity);
    this.reset(850, 300);
    this.kill();
  }

  update() {
    const playerHit = this.game.physics.arcade.collide(this.game.player, this);

    if (playerHit) {
      this.playerCollision.dispatch(this);
      this.stop();
    }
  }
}

export class ObstaclesGroup extends Phaser.Group{
  constructor(game, sprite) {
    super(game, game.world, 'obstacles group', false, true, Phaser.Physics.ARCADE);

    this.speed = 150;
    this.angle = 0;
    this.playerCollision = new Phaser.Signal();

    for (let i = 0; i < 10; i++) {
      const obst = new Obstacle(game, 0, 0, sprite);
      obst.playerCollision.add(this.onPlayerCollision, this);
      this.add(obst, true);
    }

  }

  addObstacle(x, y) {
    this.getFirstExists(false).move(x, y, this.angle, this.speed);
  }

  onPlayerCollision(star) {
    this.playerCollision.dispatch(star);
  }
}
