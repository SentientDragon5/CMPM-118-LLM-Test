import { init } from "z3-solver";
import { tool } from "@langchain/core/tools";
import { initConvo, promptConvo } from "./llmChat.js";
import { Game } from "./Scenes/Game.js";

const { Context } = await init();

const SCALE = 2.0;
var my = {
  sprite: {},
  objects: [],
  tools: [],
  Context: Context,
  screenshot: takeScreenshot,
};

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

  const sysPrompt =
    "I am a turn based game creation software. I can edit a 50 by 38 tile map where 0,0 is the top left hand corner and 50,38 is the bottom right hand corner. in my responses I only speak in Limericks";

  initConvo(sysPrompt, log, my.tools);
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

const shareButton = document.getElementById("share-button");
if (shareButton) {
  shareButton.addEventListener("click", function () {
    my.screenshot();
  });
}

function takeScreenshot() {
  // Delay the screenshot to ensure rendering is complete
  console.log(game);
  // Get the entire game canvas
  const gameCanvas = game.canvas;

  // Create a link element
  const link = document.createElement("a");
  link.download = "savedMap.png";

  // Convert canvas to data URL
  link.href = gameCanvas.toDataURL("image/png");

  // Simulate a click to trigger the download
  link.click();
}

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
