import { chatWithAI } from "./llmChat.js";

async function consolelog(user, text) {
  console.log(user, ": ", text);
}
chatWithAI(consolelog);
