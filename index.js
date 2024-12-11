import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as dotenv from "dotenv";
import {
  HumanMessage,
  AIMessage,
  ToolMessage,
  SystemMessage,
} from "@langchain/core/messages";
import promptSync from "prompt-sync";

dotenv.config(); // Load environment variables from .env file

const llm = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash",
  temperature: 0.5,
});

const addTool = tool(
  async ({ a, b }) => {
    console.log("ADDING A AND B");
    return a + b;
  },
  {
    name: "add",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    description: "Adds a and b.",
  }
);

const multiplyTool = tool(
  async ({ a, b }) => {
    console.log("MULTIPLYING A AND B");
    return a * b;
  },
  {
    name: "multiply",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    description: "Multiplies a and b.",
  }
);

const tools = [addTool, multiplyTool];
const llmWithTools = llm.bindTools(tools);
const messages = [];
console.log("Script: Tools bound");

const toolsByName = {
  add: addTool,
  multiply: multiplyTool,
};

const prompt = promptSync();
async function humanTurn() {
  const response = prompt("You: ");
  messages.push(new HumanMessage(response));
  return response;
}
async function aiTurn(text) {
  var response = await llmWithTools.invoke(messages);
  messages.push(response);

  for (const toolCall of response.tool_calls) {
    const selectedTool = toolsByName[toolCall.name];
    const result = await selectedTool.invoke(toolCall);

    const toolMessage = new ToolMessage({
      toolName: toolCall.name,
      content: result.toString(),
    });
    messages.push(toolMessage);
    console.log("Tool: " + toolMessage.content);
  }

  response = await llmWithTools.invoke(messages);
  messages.push(response);
  return "AI: " + response.content;
}

async function chatWithAI() {
  console.log('Script: Chat starting. to quit return "e"');

  const sysPrompt = "I am an AI and I only speak in Limericks";
  messages.push(new SystemMessage(sysPrompt));
  console.log("Sys: " + sysPrompt);

  while (true) {
    const humanPrompt = await humanTurn();
    if (humanPrompt.toLowerCase() === "e") {
      console.log("Script: System Quitting");
      break;
    }

    const result = await aiTurn(prompt);
    console.log(result);
  }
}

chatWithAI();
