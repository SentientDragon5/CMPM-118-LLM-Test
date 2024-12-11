import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as dotenv from "dotenv";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";

dotenv.config(); // Load environment variables from .env file

const llm = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash",
  temperature: 0,
});

const addTool = tool(
  async ({ a, b }) => {
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
console.log("==== E ====");

const messages = [new HumanMessage("What is 3 * 12? Also, what is 11 + 49?")];

const aiMessage = await llmWithTools.invoke(messages);

console.log(aiMessage);

messages.push(aiMessage);
console.log("==== D ====");

const toolsByName = {
  add: addTool,
  multiply: multiplyTool,
};

console.log("==== A ====");
for (const toolCall of aiMessage.tool_calls) {
  const selectedTool = toolsByName[toolCall.name];
  const result = await selectedTool.invoke(toolCall);

  // Wrap the result in a ToolMessage
  const toolMessage = new ToolMessage({
    toolName: toolCall.name,
    content: result.toString(), // Convert the result to a string
  });

  messages.push(toolMessage);
}
console.log("==== B ====");

console.log(messages);

await llmWithTools.invoke(messages);
console.log("==== C ====");
