import Phaser from 'phaser'

export class Star extends Phaser.Sprite{
  constructor(game, x, y) {
    super(game, x, y, 'star');
    this.sprite = 'star';
  }
};

export class StarRewards extends Phaser.Group{
  constructor(game) {
    super(game, game.world, 'star group', false, true, Phaser.Physics.ARCADE);
    // this.create(300, 350, 'star');
    this.add(new Star(game, 300, 350));
  }
}
