class Game extends Phaser.Scene {
  constructor(my) {
    super("game");
    this.my = my;
    console.log(my);
  }

  preload() {
    this.load.setPath("./assets/");
  }

  create() {
    console.log("Create Called");
  }

  update() {
    console.log("Update Called");
  }
}
