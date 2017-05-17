export default class Component {

  static generateUid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  constructor(game, width, height, color, x, y, type) {
    this.id = Component.generateUid();
    this.game = game;
    this.alive = true;
    this.collided = false;
    this.context = this.game.context;
    this.type = type;
    this.color = color;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
  }

  draw() {
    this.context.save();
    if (this.type === "text") {
      this.context.font = this.width + " " + this.height;
      this.context.fillStyle = this.color;
      this.context.fillText(this.text, this.x, this.y);
    } else {
      this.context.fillStyle = this.color;
      this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    this.context.restore();
  }

  update() {
    this.gravitySpeed += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY + this.gravitySpeed;
    if (this.type !== 'star') {
      this.hitBottom();
    }
  }

  hitBottom() {
    const rockbottom = this.game.canvas.height - this.height;
    if (this.y > rockbottom) {
      this.y = rockbottom;
      this.gravitySpeed = 0;
    }
  }

  crashWith(otherobj) {
    const myleft = this.x;
    const myright = this.x + (this.width);
    const mytop = this.y;
    const mybottom = this.y + (this.height);
    const otherleft = otherobj.x;
    const otherright = otherobj.x + (otherobj.width);
    const othertop = otherobj.y;
    const otherbottom = otherobj.y + (otherobj.height);
    let crash = true;
    if ((mybottom < othertop) || (mytop > otherbottom) ||
      (myright < otherleft) || (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }
}
