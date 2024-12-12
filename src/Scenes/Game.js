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
    my.tools.push(...[this.displayAtTool, this.displayWithinTool, this.createMapTool]);
    this.tileSize = 16;
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
      this.my.objects.push(this.add.sprite(x*this.tileSize, y*this.tileSize, "blue"));

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
      let answerSet = []
      answerSet = await this.checkPlace(xMin, xMax, yMin, yMax);
      if (answerSet.length == 0) {
        console.log("No valid positions found");
        return "No valid positions available";
      }
      let randomSetIndex = Math.floor(Math.random() * answerSet.length);
      console.log(randomSetIndex);
      let randomCoord = answerSet[randomSetIndex];
      let x = randomCoord.x*this.tileSize;
      let y = randomCoord.y*this.tileSize;
      console.log(answerSet);
      console.log("Displaying " + sprite + " at ", x/this.tileSize, ",", y/this.tileSize);
      this.my.objects.push(this.add.sprite(x, y, "blue"));
      return sprite + " displayed at " + x/this.tileSize + " , " + y/this.tileSize; // returns for the log and for the ai to know
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
    const results = new Set();
    while (await solver.check() === "sat") {
      const model = solver.model();
      const xVal = parseInt(model.eval(xvar).asString());
      const yVal = parseInt(model.eval(yvar).asString());
  
      const coordStr = `${xVal},${yVal}`;
      results.add(coordStr);

      solver.add(Not(And(xvar.eq(xVal), yvar.eq(yVal))));
    }

    return Array.from(results).map(coord => {
      const [x, y] = coord.split(",").map(Number);
      return { x, y };
    });
  }
  
  createMapTool = tool(
    async ({ sprite, x, y }) => {
      console.log("Creating map of " + sprite + " with size " + x + "x" + y);
      this.grid = [];
      for (let y1 = 0; y1 < y; y1++) {
        this.grid[y1] = [];
        for (let x1 = 0; x1 < x; x1++) {
          const posX = this.tileSize / 2 + x1 * this.tileSize;
          const posY = this.tileSize / 2 + y1 * this.tileSize;
          const tileSprite = this.add.sprite(posX, posY, sprite);
          this.grid[y1][x1] = { sprite: tileSprite };
        }
      }
      this.my.objects.push(this.grid);
      return sprite + " map created with size " + x + "x" + y; // returns for the log and for the AI to know
    },
    {
      name: "createMap",
      schema: z.object({
        sprite: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      description: "Create a map of size x and y",
    }
  );
}