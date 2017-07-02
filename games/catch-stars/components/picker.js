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
    const middle = Math.floor(this.game.width / 2);
    this.movementLimit = Math.floor((this.game.width / 2) - this.width);

    if (this.controlsType === 'Leap') {
      const dist = this.controls.getFingersDistance(
        'middleFinger', 'ringFinger');
      if (!dist || !dist.distance) {
        return;
      }
      // console.log('Dist object from controls', dist);
      const distance = Math.floor(dist.distance);
      const min = Math.max(Math.floor(dist.min), 12);
      const max = Math.floor(dist.max);
      // const moveFactor = dist.distance * this.movementLimit / dist.max;
      const moveFactor = Math.floor((distance - min) * this.movementLimit / max);
      if (this.side === 'left') {
        this.x = middle - this.width - moveFactor;
      }
      if (this.side === 'right') {
        this.x = middle + moveFactor;
      }
    }
  }

  enableLeapControls(){
    this.controlsType = 'Leap';
    this.controls = window.leapControls;
  }
}
