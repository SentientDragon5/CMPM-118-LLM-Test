import { Scene } from "phaser";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
export class Game extends Phaser.Scene {
  constructor(my) {
    super("game");
    this.my = my;

    // Add tools here

    my.tools.push(
      ...[
        this.displayAtTool,
        this.displayWithinTool,
        this.displayTextAtTool,
        this.createMapTool,
        this.removeTool,
      ]
    );
    this.tileSize = 16;
  }

  init() {
    console.log(this);
    let objects = [];
    this.my.state.objects.forEach((obj) => {
      // this.add.existing(obj);
      // console.log("added ", obj);

      const a = this.add.sprite(obj.x, obj.y, obj.name);
      a.name = obj.name;
      objects.push(a);
    });
    this.my.state.objects = objects;
    console.log("postload: ", this.scene);
  }

  preload() {
    this.load.setPath("./assets/");

    this.load.image("blue", "blue_townie.png");
    this.load.image("dirt", "dirt.png");
    this.load.image("grass", "grass.png");
    this.load.image("flower grass", "flower_grass.png");
    this.load.image("bush", "bush.png");
    this.load.image("tree", "tree.png");
    this.load.image("mushroom", "mushroom.png");
    this.load.image("wheelbarrow", "wheelbarrow.png");
  }

  create() {
    console.log("Create Called");
  }

  update() {
    console.log("Update Called");
  }

  removeTool = tool(
    async ({ obj, x, y }) => {
      console.log("removing " + obj + " at ", x, ",", y);
      const toRemove = this.my.state.objects.filter(
        (o) =>
          o.name == obj &&
          Math.sqrt(
            (o.x / this.tileSize - x) * (o.x / this.tileSize - x) +
              (o.y / this.tileSize - y) * (o.y / this.tileSize - y)
          ) < 5
      );
      toRemove.forEach((o) => {
        o.destroy();
      });

      return obj + " removed at " + x + " , " + y; // returns for the log and for the ai to know
    },
    {
      name: "remove",
      schema: z.object({
        obj: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      description: "removes an object near coordinates x and y",
    }
  );

  displayAtTool = tool(
    async ({ sprite, x, y }) => {
      console.log("Displaying " + sprite + " at ", x, ",", y);
      const obj = this.add.sprite(x * this.tileSize, y * this.tileSize, sprite);
      obj.name = sprite;
      this.my.state.objects.push(obj);

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

  displayTextAtTool = tool(
    async ({ text, x, y }) => {
      console.log("Displaying " + text + " at ", x, ",", y);
      this.my.state.objects.push(
        this.add.text(x * this.tileSize, y * this.tileSize, text)
      );

      return text + " displayed at " + x + " , " + y;
    },
    {
      name: "displayTextAt",
      schema: z.object({
        text: z.string(),
        x: z.number(),
        y: z.number(),
      }),
      description: "Displays text at coordinates x and y",
    }
  );

  displayWithinTool = tool(
    async ({ sprite, xMin, xMax, yMin, yMax }) => {
      let answerSet = [];
      answerSet = await this.checkPlace(xMin, xMax, yMin, yMax);
      if (answerSet.length == 0) {
        console.log("No valid positions found");
        return "No valid positions available";
      }
      let randomSetIndex = Math.floor(Math.random() * answerSet.length);
      console.log(randomSetIndex);
      let randomCoord = answerSet[randomSetIndex];
      let x = randomCoord.x * this.tileSize;
      let y = randomCoord.y * this.tileSize;
      console.log(answerSet);
      console.log(
        "Displaying " + sprite + " at ",
        x / this.tileSize,
        ",",
        y / this.tileSize
      );
      this.my.state.objects.push(this.add.sprite(x, y, sprite));
      return (
        sprite +
        " displayed (within) at " +
        x / this.tileSize +
        " , " +
        y / this.tileSize
      ); // returns for the log and for the ai to know
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
    while ((await solver.check()) === "sat") {
      const model = solver.model();
      const xVal = parseInt(model.eval(xvar).asString());
      const yVal = parseInt(model.eval(yvar).asString());

      const coordStr = `${xVal},${yVal}`;
      results.add(coordStr);

      solver.add(Not(And(xvar.eq(xVal), yvar.eq(yVal))));
    }

    return Array.from(results).map((coord) => {
      const [x, y] = coord.split(",").map(Number);
      return { x, y };
    });
  }

  createMapTool = tool(
    async ({ sprite, x, y }) => {
      console.log("Creating map of " + sprite + " with size " + x + "x" + y);
      this.grid = [];
      for (let gridY = 0; gridY < y; gridY++) {
        this.grid[gridY] = [];
        for (let gridX = 0; gridX < x; gridX++) {
          const posX = this.tileSize / 2 + gridX * this.tileSize;
          const posY = this.tileSize / 2 + gridY * this.tileSize;
          const tileSprite = this.add.sprite(posX, posY, sprite);
          this.grid[gridY][gridX] = { sprite: tileSprite };
        }
      }
      this.my.state.objects.push(this.grid);
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
