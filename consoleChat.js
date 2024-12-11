import { chatWithAI } from "./llmChat.js";
import promptSync from "prompt-sync";

async function consolelog(user, text) {
  console.log(user, ": ", text);
}
const prompt = promptSync();
chatWithAI(consolelog, prompt);
