import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";

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

const model = new ChatAnthropic({
  model: "claude-3-5-sonar-latest",
});

const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What's the weather in Tokyo?",
    },
  ],
});

// console.log(result);

console.log(result.messages.at(-1)?.content);
