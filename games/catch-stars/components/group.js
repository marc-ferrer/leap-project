export default class Group {
  constructor(game) {
    this.components = new Map();
    this.game = game;
  }

  update() {
    for (let [id, c] of this.components) { // eslint-disable-line no-unused-vars
      c.update();
      if (c.type === 'star' && ! c.collided) {
        if (c.crashWith(this.game.lPicker)) {
          c.collided = true;
          this.game.canvas.dispatchEvent(new Event('collision'));
        }
        if (c.crashWith(this.game.rPicker)) {
          c.collided = true;
          this.game.canvas.dispatchEvent(new Event('collision'));
        }
      }

      // TODO: create an animation to reflect that the user picker a star
      if (c.y > this.game.height || c.collided) {
        this.remove(c);
        if (!c.collided) {
          this.game.canvas.dispatchEvent(new Event('starMiss'));
        }
      }
    }
  }

  draw() {
    for (let [id, c] of this.components) { // eslint-disable-line no-unused-vars
      c.draw();
    }
  }

  add(c) {
    this.components.set(c.id, c);
  }

  remove(c) {
    c.alive = false;
    this.components.delete(c.id);
  }

  removeAll() {
    for (let [id, c] of this.components) { // eslint-disable-line no-unused-vars
      this.remove(c);
    }
  }

  get length() {
    return this.components.size;
  }
}
