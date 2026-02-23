import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import z from "zod";

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

const jsExecutor = tool(
  async ({ code }) => {
    console.log("i should run the following code:");
    console.log(code);
    console.log("-----------------------------------------------");
    const result = await eval(code);
    console.log("-----------------------------------------------");

    console.log("result", result);

    return {
      stdout: result,
      stderr: "",
    };
  },
  {
    name: "run_javascript_code_tool",
    description: `
      Run general purpose javascript code. 
      This can be used to access Internet or do any computation that you need. 
      The output will be composed of the stdout and stderr. 
      The code should be written in a way that it can be executed with javascript eval in node environment.
    `,
    schema: z.object({
      code: z.string().describe("code to be executed"),
    }),
  },
);
const model = new ChatOpenAI({
  // modelName: "gpt-4o-mini",
  modelName: "gpt-4.1",
  temperature: 0,
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool, jsExecutor],
  checkpointSaver,
});
