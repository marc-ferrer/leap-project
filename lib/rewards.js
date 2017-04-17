import Phaser from 'phaser'

export class Star extends Phaser.Sprite{
  constructor(game, x, y) {
    let nx = x || 0;
    let ny = y || 0;

    super(game, nx, ny, 'star');
    this.sprite = 'star';

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    this.exists = false;
  }

  move(x, y, angle, speed) {
    this.reset(x, y);

    this.game.physics.arcade.velocityFromAngle(angle, -speed, this.body.velocity);

    this.angle = angle;
  }

  update() {
    const starHit = this.game.physics.arcade.collide(this.game.player, this);

    if (starHit) {
      console.log('Star collided with player', starHit);
      // TODO: remove star and add a temporary sprite to indicate that you
      //        have earned an star. Maybe an small explosion.
    }
  }
};

export class StarRewards extends Phaser.Group{
  constructor(game) {
    super(game, game.world, 'star group', false, true, Phaser.Physics.ARCADE);
    // this.create(300, 350, 'star');
    // this.add(new Star(game, 300, 350));

    this.speed = 150;
    this.angle = 0;

    for (let i = 0; i < 10; i++) {
      this.add(new Star(game), true);
    }

    this.enableBody = true;
  }

  addReward(x, y) {
    console.log('Get first exist', this.getFirstExists(false));
    this.getFirstExists(false).move(x, y, this.angle, this.speed);
  }
}
