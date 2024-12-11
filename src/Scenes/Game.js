import { Scene } from "phaser";
export class Game extends Phaser.Scene {
  constructor(my) {
    super("game");
    this.my = my;
    my.objects.push("Such and such");
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
