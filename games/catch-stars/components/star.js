import Component from './component';

export default class Star extends Component {
  constructor(game, width, height, color, x, y) {
    super(game, width, height, color, x, y, 'star');
  }

  draw() {
    this.context.save();
    this.context.shadowBlur = 5;
    this.context.shadowColor = '#ffff33';
    this.drawStar(5, 30, 15);
    this.context.restore();
  }

  drawStar(spikes, outerRadius, innerRadius, fill){
      let rot = Math.PI / 2 * 3;
      let x = this.x;
      let y = this.y;
      let step = Math.PI / spikes;

      this.context.beginPath();
      this.context.moveTo(this.x, this.y - outerRadius)
      for(let i = 0; i < spikes; i++){
        x = this.x + Math.cos(rot) * outerRadius;
        y = this.y + Math.sin(rot) * outerRadius;
        this.context.lineTo(x, y)
        rot+= step

        x = this.x+ Math.cos(rot) * innerRadius;
        y = this.y + Math.sin(rot) * innerRadius;
        this.context.lineTo(x, y)
        rot+= step
      }
      this.context.lineTo(this.x, this.y -outerRadius);
      this.context.closePath();
      this.context.lineWidth = 5;
      this.context.strokeStyle = this.color;
      this.context.stroke();
      if (fill) {
        this.context.fillStyle = 'skyblue';
        this.context.fill();
      }
    }
}
