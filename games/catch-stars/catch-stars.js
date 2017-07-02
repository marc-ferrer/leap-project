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
    this.maxSpeed = 10;
    this.backgroundColor = 'black';

    this.canvas.addEventListener('collision', this.collectStar.bind(this));
    this.canvas.addEventListener('starMiss', this.onStarMiss.bind(this));
  }

  clear() {
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.width, this.height);
  }

  reset() {
    this.score = 0;
    this.speed = 1;
    this.lifes = 5;
    this.starsInterval = 3000; // ms
    this.lastStar = 0;

    if (this.scoreComponent) {
      this.scoreComponent.text = 'SCORE:   0';
      this.scoreComponent.draw();
    }
    if (this.lifesComponent) {
      this.lifesComponent.text = 'LIFES:   ' + this.lifes;
      this.lifesComponent.draw();
    }
    if (this.stars) {
      this.stars.removeAll();
    }
  }

  start() {
    this.reset();
    this.clear();
    this.stars = new Group(this);

    const mid = Math.floor(this.width / 2);
    this.lPicker = new Picker(
      this, 30, 30, 'red', mid - 90, this.height - 100, 'left');
    this.rPicker = new Picker(
      this, 30, 30, 'red', mid + 60, this.height - 100, 'right');

    this.scoreComponent = new Component(
      this, '30px', 'Consolas', 'white', this.width - 200, 40, 'text');
    this.scoreComponent.text = 'SCORE:   0';
    this.lifesComponent = new Component(
      this, '30px', 'Consolas', 'white', this.width - 200, 80, 'text');
    this.lifesComponent.text = 'LIFES:   ' + this.lifes;
    this.lPicker.enableLeapControls();
    this.rPicker.enableLeapControls();
    window.requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    window.cancelAnimationFrame(this.animationId);
  }

  addStar(tFrame) {
    const stx = Math.floor(Math.random() * (this.width - 100)) + 50;
    const sty = 0;
    const star = new Star(this, 30, 15, 'yellow', stx, sty);
    star.speedY = this.speed;
    this.stars.add(star);
    this.lastStar = tFrame;
  }

  update(tFrame) {
    if (tFrame - this.lastStar > this.starsInterval) {
      this.addStar(tFrame);
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
    this.lifesComponent.draw();
  }

  animate(tFrame) {
    this.animationId = window.requestAnimationFrame(this.animate.bind(this));
    this.clear();

    this.update(tFrame);
    this.render();
    this.lastRender = tFrame;
  }

  collectStar() {
    this.score+= 10;

    this.scoreComponent.text = 'SCORE:   ' + this.score;

    if (this.score % 30 === 0 && this.speed < this.maxSpeed) {
      this.speed++;
    }
  }

  handleReplay(key) {
    if (this.state !== 'Over') {
      return;
    }
    if (key.keyCode === 27) { // Esc
      document.removeEventListener('keyup', this.handleReplay);
      this.reset();
      window.requestAnimationFrame(this.animate.bind(this));
    }
  }

  gameOver() {
    this.state = 'Over';
    this.stop();
    this.clear();
    this.scoreComponent.draw();
    this.gameOverComponent = new Component(this, '24px', 'Consolas', 'yellow',
      (this.width / 2) - 80, (this.height / 2) - 24, 'text');
    this.gameOverComponent.text = 'GAME OVER';
    this.gameOverComponent.draw();
    this.replayComponent = new Component(this, '24px', 'Consolas', 'yellow',
      (this.width / 2) - 160, this.height / 1.7, 'text');
    this.replayComponent.text = 'Press ESC if you want to replay';
    this.replayComponent.draw();
    document.addEventListener('keyup', this.handleReplay.bind(this));
  }

  onStarMiss() {
    console.log('Star missed');
    if (this.lifes > 0) {
      this.lifes--;
    }
    this.lifesComponent.text = 'LIFES:   ' + this.lifes;
    if (this.lifes <= 0) {
      this.gameOver();
    }
  }
}

window.addEventListener('load', () => {
  const catchGame = new CatchStarsGame(document.getElementById('game'));
  window.catchGame = catchGame;
  catchGame.start();
});
