import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY,
});

const agent = createReactAgent({
  llm: model,
  tools: [],
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "Hello, How can you help me today?" }],
});

console.log(result.messages.at(-1)?.content);
