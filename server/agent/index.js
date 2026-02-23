// server/agent/index.js
import express from "express";
import cors from "cors";
import { agent } from "./OpenAiAgent.js";
// import { agent } from "./GeminiAgent.js";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/generate", async (req, res) => {
  const { prompt, thread_id } = req.body;
  try {
    const result = await agent.invoke(
      {
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        configurable: { thread_id: thread_id },
      },
    );

    res.json({ response: result.messages.at(-1)?.content });
  } catch (error) {
    console.error("Error in /gemini-agent:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
