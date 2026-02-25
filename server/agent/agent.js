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

async function evalAndCaptureOutput(code) {
  const oldLog = console.log;
  const oldError = console.error;

  const output = [];
  let errorOutput = [];

  console.log = (...args) => output.push(args.join(" "));
  console.error = (...args) => errorOutput.push(args.join(" "));

  try {
    await eval(code);
  } catch (error) {
    errorOutput.push(error.message);
  }

  console.log = oldLog;
  console.error = oldError;

  return { stdout: output.join("\n"), stderr: errorOutput.join("\n") };
}

const jsExecutor = tool(
  async ({ code }) => {
    console.log("i should run the following code:");
    console.log(code);
    console.log("-----------------------------------------------");
    const result = await evalAndCaptureOutput(code);
    console.log("-----------------------------------------------");

    console.log("result", result);

    return result;
  },
  {
    name: "run_javascript_code_tool",
    description: `
      Run general purpose javascript code to do computation or fetch data from the Internet.
      CRITICAL RULES:
      1. This is an ES Module environment. DO NOT use require() anywhere.
      2. For network requests, use the native global fetch() API.
      3. DO NOT use top-level await. You must use Promises with .then().
      4. You MUST use console.log() to output the final answer so it can be captured by the stdout.
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
