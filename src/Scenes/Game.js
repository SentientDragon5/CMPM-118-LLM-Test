import { Scene } from "phaser";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
export class Game extends Phaser.Scene {
  constructor(my) {
    super("game");
    this.my = my;
    my.objects.push("Such and such");
    console.log(my);

    // Add tools here
    my.tools.push(...[this.displayTool]);
  }

  preload() {
    this.load.setPath("./assets/");

    this.load.image("blue", "blue_townie.png");
  }

  create() {
    console.log("Create Called");
  }

  update() {
    console.log("Update Called");
  }

  displayTool = tool(
    async ({ sprite, x, y }) => {
      console.log("Displaying " + sprite + " at ", x, ",", y);
      this.my.objects.push(this.add.sprite(x, y, "blue"));

      return sprite + " displayed at " + x + " , " + y; // returns for the log and for the ai to know
    },
    {
      name: "display",
      schema: z.object({
        sprite: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      description: "Displays a sprite at coordinates x and y",
    }
  );
}
