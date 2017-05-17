import Component from './components/component';
import Star from './components/star';
import Group from './components/group';
import Picker from './components/picker';

class CatchStarsGame {

  constructor(canvas) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.frameNo = 0;
    this.score = 0;

    this.canvas.addEventListener('collision', this.collectStar.bind(this));
  }

  start() {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);
    this.stars = new Group(this);

    const mid = Math.floor(this.width / 2);
    this.lPicker = new Picker(
      this, 30, 30, 'red', mid - 90, this.height - 100, 'left');
    this.rPicker = new Picker(
      this, 30, 30, 'red', mid + 60, this.height - 100, 'right');

    this.scoreComponent = new Component(
      this, '30px', 'Consolas', 'white', this.width - 200, 40, 'text');
    this.scoreComponent.text = 'SCORE: 0000';
    window.requestAnimationFrame(this.main.bind(this));
  }

  stop() {
    window.cancelAnimationFrame(this.animatioId);
  }

  main(tFrame) {
    this.animatioId = window.requestAnimationFrame(this.main.bind(this));
    this.clear();
    this.frameNo += 1;

    this.update(tFrame);
    this.render();
    this.lastRender = tFrame;
  }

  update(tFrame) {
    if (this.everyinterval(150)) {
      const stx = Math.floor(Math.random() * (this.width));
      const sty = 0;
      const star = new Star(this, 20, 20, 'yellow', stx, sty);
      star.speedY = 1;
      this.stars.add(star);
      this.lastStar = tFrame;
    }

    this.lPicker.update();
    this.rPicker.update();

    this.stars.update();
  }

  render() {
    this.lPicker.draw();
    this.rPicker.draw();

    this.stars.draw();
    this.scoreComponent.draw();
  }

  clear() {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  everyinterval(n) {
    if ((this.frameNo / n) % 1 == 0) {
      return true;
    }
    return false;
  }

  collectStar() {
    this.score+= 10;

    this.scoreComponent.text = 'SCORE: ' + this.score;
  }
}

window.addEventListener('load', () => {
  console.log('catch stars loaded successfully');
  const catchGame = new CatchStarsGame(document.getElementById('game'));
  window.catchGame = catchGame;
  catchGame.start();
});
