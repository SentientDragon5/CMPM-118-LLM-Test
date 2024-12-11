//import { init } from "z3-solver";
import { tool } from "@langchain/core/tools";
import { initConvo, promptConvo } from "./llmChat.js";

import { Game } from "./src/Scenes/Game";
// const { Context } = await init();

// var cursors;
const SCALE = 2.0;
var my = { sprite: {}, objects: [], tools: [] };

console.log(my);

// game config
let config = {
  parent: "app",
  type: Phaser.CANVAS,
  render: {
    pixelArt: true, // prevent pixel art from getting blurred when scaled
  },
  width: 800,
  height: 600,
  scene: {
    create: create,
  },
};
function create() {
  this.scene.add("Game", new Game(my), true); // Start the scene and pass myData

  initConvo(log, my.tools);
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
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // Prevent the default newline behavior
    sendMessage();
  }
});
function displayMessage(sender, message) {
  const sanitizedSender = sender.replace(/ /g, "-");
  const messageElement = document.createElement("div");
  messageElement.classList.add(sanitizedSender);

  // Add class for user or bot:
  messageElement.classList.add(sender === "You" ? "user" : "other");

  const senderLabel = document.createElement("span");
  senderLabel.textContent = sender + ": ";
  senderLabel.style.fontWeight = "bold";

  const messageWithLineBreaks = message.replace(/\n/g, "<br>");

  messageElement.appendChild(senderLabel);
  messageElement.innerHTML += messageWithLineBreaks;

  chatOutput.appendChild(messageElement);

  const spacer = document.createElement("div");
  spacer.style.marginBottom = "10px";
  chatOutput.appendChild(spacer);

  chatOutput.scrollTop = chatOutput.scrollHeight;
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
