import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import z from "zod";
import { MemorySaver } from "@langchain/langgraph";

const weatherTool = tool(
  async ({ query }) => {
    console.log("query", query);

    // TODO: Implement the weather tool by fetching an API

    return "The weather in Tokyo is sunny.";
  },
  {
    name: "weather",
    description: "Get the weather in a given location",
    schema: z.object({
      query: z.string().describe("The query to use in search"),
    }),
  },
);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.1,
  apiKey: process.env.GEMINI_API_KEY,
});

const checkpointSaver = new MemorySaver();

const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkpointSaver,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What's the weather in Tokyo?",
      },
    ],
  },
  {
    configurable: { thread_id: 42 },
  },
);

const followup = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What city is that for?",
      },
    ],
  },
  {
    configurable: { thread_id: 42 },
  },
);

// console.log(result);

console.log(result.messages.at(-1)?.content);
console.log("followup:", followup.messages.at(-1)?.content);
