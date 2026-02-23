import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";

const model = new ChatAnthropic({
  model: "claude-3-5-sonar-latest",
});

const agent = createReactAgent({
  llm: model,
  tools: [],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "Hello, How can you help me today?",
    },
  ],
});

// console.log(result);

console.log(result.messages.at(-1)?.content);
