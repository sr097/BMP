import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/llm", async (req, res) => {
  try {
    const userPrompt = req.body?.prompt || "Hello!";

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      res.json({
        success: true,
        response:
          "This tool uses AI to explain figurative language and social situations. To enable AI responses, add a GROQ_API_KEY secret in your Replit environment.",
      });
      return;
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that explains figurative language, social situations, and conversations clearly and simply for autistic teens. Use plain language, be direct and specific, and avoid sarcasm or idioms in your explanations.",
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      req.log.error({ status: response.status, body: errText }, "Groq API error");
      res.status(500).json({ success: false, error: "AI service error" });
      return;
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const responseText = data.choices[0].message.content;

    res.json({ success: true, response: responseText });
  } catch (error) {
    req.log.error({ error }, "Error calling LLM");
    res.status(500).json({ success: false, error: "Failed to process request" });
  }
});

export default router;
