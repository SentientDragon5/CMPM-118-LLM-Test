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
