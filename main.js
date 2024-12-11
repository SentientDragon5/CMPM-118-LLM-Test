import { init } from "z3-solver";

const { Context } = await init();

var cursors;
const SCALE = 2.0;
var my = { sprite: {}, Context: Context };

console.log(my);

// game config
let config = {
  parent: "phaser-game",
  type: Phaser.CANVAS,
  render: {
    pixelArt: true, // prevent pixel art from getting blurred when scaled
  },
  width: 1280,
  height: 800,
  scene: {
    create: create,
  },
};
function create() {
  this.scene.add("Load", new Load(my), true); // Start the scene and pass myData
}

const game = new Phaser.Game(config);

function displayMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(sender); // Add a class for styling
  messageElement.textContent = message;
  chatOutput.appendChild(messageElement);
}

function sendMessage() {
  const message = messageInput.value;
  // Clear the input field
  messageInput.value = "";
  // Display the message (example)
  displayMessage(message, "user"); // 'user' indicates the sender
  // Send the message to your chat server (if applicable)
}
