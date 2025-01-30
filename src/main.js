import { init } from "z3-solver";
import { tool } from "@langchain/core/tools";
import { initConvo, loadConvo, promptConvo } from "./llmChat.js";
import { Game } from "./Scenes/Game.js";

const { Context } = await init();

const SCALE = 2.0;
var my = {
  state: {
    objects: [],
    messages: [],
  },
  tools: [],
  Context: Context,
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
let gameScene = null;
function create() {
  gameScene = this.scene.add("Game", new Game(my), true); // Start the scene and pass myData

  const sysPrompt =
    "I am a turn based game creation software. I can edit a 50 by 38 tile map where 0,0 is the top left hand corner and 50,38 is the bottom right hand corner. I will provide concise and helpful answers.";

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

const exportImageButton = document.getElementById("export-image-button");
const exportJsonButton = document.getElementById("export-json-button");
const loadJsonButton = document.getElementById("load-json-button");

// --- Export Image ---
exportImageButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "savedMap.png";
  link.href = game.canvas.toDataURL("image/png");
  link.click();
});

// --- Export JSON ---
exportJsonButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "gameData.json";

  // save messages
  const jsonData = JSON.stringify(my.state);
  const jsonBlob = new Blob([jsonData], { type: "application/json" });
  link.href = URL.createObjectURL(jsonBlob);

  link.click();
});

// --- Load JSON ---
loadJsonButton.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const jsonData = JSON.parse(event.target.result);
      // Load the jsonData into your game (implementation depends on your game logic)
      console.log("JSON loaded:", jsonData);
      my.state = {};

      // 2. Populate the object with the JSON data
      for (const key in jsonData) {
        if (Object.hasOwnProperty.call(jsonData, key)) {
          my.state[key] = jsonData[key];
        }
      }
      const history = my.state.messages;
      my.state.messages = [];
      loadConvo(history);
      console.log(gameScene);
      gameScene.init();
    };
    reader.readAsText(file);
  };

  input.click(); // Trigger the file input dialog
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
  my.state.messages.push({ user: user, text: text });
  console.log("log ", gameScene.sys.displayList.list);
}
