import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import promptSync from "prompt-sync";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const prompt = promptSync();

const template = "write back in only limericks";
const promptTemplate = new PromptTemplate({
  template: "write back in only {style}",
  inputVariables: ["style"],
});
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash",
  temperature: 0.9,
});
const formated = await promptTemplate.format({
  style: "5 line limerick",
});
const resp = await model.invoke(formated);
console.log("resp: ", resp.content);
//return;
// const llmChain = new LLMChain({
//   llm: geminiModel,
//   prompt: promptTemplate,
// });

// Create a function to call the Langchain API
async function chatCompletion(text) {
  const response = await model.invoke(text);

  return "AI:" + response.content;
}

async function chatWithAI() {
  console.log("Hello! I'm an AI. How can I help you today?");

  while (true) {
    const prompt = await askForInput();
    if (prompt.toLowerCase() === "e") {
      console.log("Goodbye!");
      break;
    }

    const result = await chatCompletion(prompt);
    console.log(result);
  }
}

async function askForInput() {
  return prompt("You: ");
}

//chatWithAI();
