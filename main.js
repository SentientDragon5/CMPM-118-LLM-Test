//import { init } from "z3-solver";
import { initConvo, promptConvo } from "./llmChat.js";

// const { Context } = await init();

// var cursors;
const SCALE = 2.0;
var my = { sprite: {}, objects: {} };

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

const chatOutput = document.getElementById("chat-output");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
if (sendButton) {
  sendButton.addEventListener("click", sendMessage);
} else {
  console.error("Send button not found!");
}

function displayMessage(sender, message) {
  const sanitizedSender = sender.replace(/ /g, "-"); // Replace all spaces with hyphens
  const messageElement = document.createElement("div");
  messageElement.classList.add(sanitizedSender);
  messageElement.textContent = message;
  chatOutput.appendChild(messageElement);
}

function sendMessage() {
  const message = messageInput.value;
  messageInput.value = "";
  promptConvo(message);
}

async function log(user, text) {
  console.log(user, ": ", text);
  displayMessage(user, text);
}
initConvo(log);
