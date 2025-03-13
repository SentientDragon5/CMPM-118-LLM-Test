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

//dotenv.config(); // Load environment variables from .env file

let llm; // Declare llm outside the function

async function initializeLLM(apiKey) {
  llm = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    temperature: 0.5,
    apiKey: apiKey,
  });

  llmWithTools = llm.bindTools(tools); // Initial binding
}

// Function to get API key from local storage or prompt user
async function getApiKey() {
  let apiKey = localStorage.getItem("googleApiKey");
  if (!apiKey) {
    apiKey = prompt("Please enter your Google API key:");
    if (apiKey) {
      localStorage.setItem("googleApiKey", apiKey);
    } else {
      alert("API key is required to use this application.");
      return null; // Or handle the missing API key appropriately
    }
  }
  return apiKey;
}

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

let tools = [addTool, multiplyTool]; // Initialize tools here
let llmWithTools; // Initial binding
let messages = [];

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
async function initConvo(sysPrompt, logFunc, moreTools) {
  log = logFunc;

  // Get API key
  const apiKey = await getApiKey();
  if (!apiKey) {
    return; // Or handle the missing API key appropriately
  }

  // Initialize LLM with API key
  await initializeLLM(apiKey);

  // Rebind tools with more tools
  tools = [...tools, ...moreTools];
  llmWithTools = llm.bindTools(tools);
  moreTools.forEach((tool) => {
    toolsByName[tool.name] = tool;
  });
  console.log("TOOLS initiated: ", tools);

  messages.push(new SystemMessage(sysPrompt));
  log("System", sysPrompt);
}
async function loadConvo(history) {
  while (messages.length > 0) {
    messages.pop();
  }
  history.forEach((message) => {
    if (message.user == "You") {
      messages.push(new HumanMessage(message.text));
    }
    if (message.user == "AI") {
      messages.push(new AIMessage(message.text));
    }
    if (message.user == "System") {
      messages.push(new SystemMessage(message.text));
    }
    if (message.user == "Tool") {
      messages.push(new ToolMessage(message.text));
    }
    log(message.user, messages[messages.length - 1].content);
  });
}
async function promptConvo(prompt) {
  const humanPrompt = await humanTurn(prompt);
  log("You", humanPrompt);
  const result = await aiTurn(messages);
  log("AI", result);
}

export { initConvo, promptConvo, loadConvo };
