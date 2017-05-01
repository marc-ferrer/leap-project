import Component from './component';

export default class Picker extends Component {
  constructor(game, width, height, color, x, y, side) {
    super(game, width, height, color, x, y, 'picker');
    this.side = side;
    this.distFactor = 10;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (window.fingerControls) {
      const middle = Math.floor(this.game.width / 2);
      // 12 is roughly the minimum distance between any finger tip a neighbour tip
      // so 6 is the distance to the center point of the line that connects two
      // finger tips
      const centerDist = (window.fingerControls.mrDistance / 2 - 6);
      if (this.side === 'left') {
        this.x = middle - this.width - (centerDist * this.distFactor);
      }
      if (this.side === 'right') {
        this.x = middle + (centerDist * this.distFactor);
      }
    }
  }

  draw() {
    // this.context.restore();
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x, this.y, this.width, this.height);
    // this.context.restore();
  }
}
