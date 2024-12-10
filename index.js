import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import promptSync from 'prompt-sync';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file


const prompt = promptSync();

// Create a function to call the Langchain API
async function chatCompletion(text) {
  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    temperature: 0.9,
  });

  const response = await model.invoke(text);

  return "AI:" + response.content
}

async function chatWithAI() {
  console.log("Hello! I'm an AI. How can I help you today?");

  while (true) {
    const prompt = await askForInput(); 
    if (prompt.toLowerCase() === "exit") {
      console.log("Goodbye!");
      break;
    }

    const result = await chatCompletion(prompt);
    console.log(result);
  }
}

async function askForInput() {
  return prompt('You: '); 
}

chatWithAI();