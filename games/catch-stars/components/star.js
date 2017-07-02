import Component from './component';

export default class Star extends Component {
  constructor(game, outerRadius, innerRadius, color, x, y, spikes) {
    super(game, outerRadius, innerRadius, color, x, y, 'star');
    this.outerRadius = outerRadius;
    this.innerRadius = innerRadius;
    this.collisionRadius = Math.ceil((innerRadius + outerRadius) / 2);

    this.spikes = spikes || 5;
    this.fillStyle = 'skyBlue';
    this.shadowColor = '#ffff33';
    this.shadowBlur = 5;
    this.lineWidth = 5;
  }

  draw() {
    this.context.save();
    this.context.shadowBlur = this.shadowBlur;
    this.context.shadowColor = this.shadowColor;
    this.drawStar(this.spikes, this.outerRadius, this.innerRadius);
    this.context.restore();
  }

  drawStar(spikes, outerRadius, innerRadius, fill){
    let rot = Math.PI / 2 * 3;
    let x = this.x;
    let y = this.y;
    let step = Math.PI / spikes;

    this.context.beginPath();
    this.context.moveTo(this.x, this.y - outerRadius)

    this.innerPoints = [];
    this.outerPoints = [];
    for(let i = 0; i < spikes; i++){
      x = this.x + Math.cos(rot) * outerRadius;
      y = this.y + Math.sin(rot) * outerRadius;
      this.outerPoints.push([x, y]);
      this.context.lineTo(x, y)
      rot+= step

      x = this.x+ Math.cos(rot) * innerRadius;
      y = this.y + Math.sin(rot) * innerRadius;
      this.innerPoints.push([x, y]);
      this.context.lineTo(x, y)
      rot+= step
    }
    this.context.lineTo(this.x, this.y -outerRadius);
    this.context.closePath();
    this.context.lineWidth = this.lineWidth;
    this.context.strokeStyle = this.color;
    this.context.stroke();
    if (fill) {
      this.context.fillStyle = this.fillStyle;
      this.context.fill();
    }
  }

  crashWith(otherobj) {
    const otherleft = otherobj.x;
    const otherright = otherobj.x + (otherobj.width);
    const othertop = otherobj.y;
    const otherbottom = otherobj.y + (otherobj.height);

    // generate bounding circles
    if (!this.outerPoints || !this.innerPoints) {
      return false;
    }
    const topY = Math.min(...this.outerPoints.map(p => p[1]));
    const bottomY = Math.max(...this.outerPoints.map(p => p[1]));
    const leftX = Math.min(...this.outerPoints.map(p => p[0]));
    const rightX = Math.max(...this.outerPoints.map(p => p[0]));
    const centerY = Math.ceil((topY + bottomY) / 2);
    const centerX = Math.ceil((leftX + rightX) / 2);

    const otherCenterX = Math.floor((otherleft + otherright) / 2);
    const otherCenterY = Math.floor((othertop + otherbottom) / 2);
    // calculate distabce between the centers
    const distX = centerX - otherCenterX;
    const distY = centerY - otherCenterY;
    const dist = Math.sqrt((distX * distX) + (distY * distY));
    // calculate other object radius:
    const otherRadius = otherobj.width;
    return dist <= (this.collisionRadius + otherRadius);
  }
}
