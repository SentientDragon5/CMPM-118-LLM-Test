import { GoogleGenerativeAI } from '@google/generative-ai';
import promptSync from 'prompt-sync';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = promptSync();

async function chatWithAI() {
  console.log("Hello! I'm an AI. How can I help you today?");

  while (true) {
    const prompt = await askForInput(); 
    if (prompt.toLowerCase() === "exit") {
      console.log("Goodbye!");
      break;
    }

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  }
}

async function askForInput() {
  return prompt('You: '); 
}

chatWithAI();