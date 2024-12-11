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
    my.tools.push(...[this.displayAtTool, this.displayWithinTool]);
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

  displayAtTool = tool(
    async ({ sprite, x, y }) => {
      console.log("Displaying " + sprite + " at ", x, ",", y);
      this.my.objects.push(this.add.sprite(x, y, "blue"));

      return sprite + " displayed at " + x + " , " + y; // returns for the log and for the ai to know
    },
    {
      name: "displayAt",
      schema: z.object({
        sprite: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      description: "Displays a sprite at coordinates x and y",
    }
  );

  displayWithinTool = tool(
    async ({ sprite, xMin, xMax, yMin, yMax }) => {
      let coords = await this.checkPlace(xMin, xMax, yMin, yMax);
      let x = coords.x;
      let y = coords.y;
      console.log("Displaying " + sprite + " at ", x, ",", y);
      this.my.objects.push(this.add.sprite(x, y, "blue"));
      return sprite + " displayed at " + x + " , " + y; // returns for the log and for the ai to know
    },
    {
      name: "displayWithin",
      schema: z.object({
        sprite: z.string(),
        xMin: z.number(),
        xMax: z.number(),
        yMin: z.number(),
        yMax: z.number(),
      }),
      description: "Displays a sprite within x max x min and y max and y min",
    }
  );
  async checkPlace(xmin, xmax, ymin, ymax) {
    const { Solver, Int, And, Or, Distinct, Not } = new this.my.Context("main");
    const solver = new Solver();

    const xvar = Int.const("x");
    const yvar = Int.const("y");

    solver.add(And(xvar.ge(xmin), xvar.le(xmax), yvar.ge(ymin), yvar.le(ymax)));

    console.log(await solver.check());
    const model = solver.model();
    const xVal = parseInt(model.eval(xvar).asString());
    const yVal = parseInt(model.eval(yvar).asString());
    const coord = { x: xVal, y: yVal };
    console.log(coord);
    return coord;
  }
}
