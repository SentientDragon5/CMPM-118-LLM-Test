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

console.log("WOrking up until now");
//dotenv.config(); // Load environment variables from .env file

const llm = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash",
  temperature: 0.5,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
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

const toolsByName = {
  add: addTool,
  multiply: multiplyTool,
};

async function humanTurn(response) {
  if (response == "") return ""; //we cant submit empty strings to gemini
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
    log("Tool", toolMessage.content);
  }

  if (response.tool_calls.length > 0) {
    response = await llmWithTools.invoke(messages);
    messages.push(response);
  }
  return response.content;
}

var log;
async function initConvo(logFunc) {
  log = logFunc;

  const sysPrompt = "I am an AI and I only speak in Limericks";
  messages.push(new SystemMessage(sysPrompt));
  log("System", sysPrompt);
}
async function promptConvo(prompt) {
  const humanPrompt = await humanTurn(prompt);
  log("You", humanPrompt);
  const result = await aiTurn(messages);
  log("AI", result);
}

export { initConvo, promptConvo };
