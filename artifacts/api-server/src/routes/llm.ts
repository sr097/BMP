import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

const MAX_PROMPT_LENGTH = 2000;

const llmLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "rate_limited",
    response: "Too many requests. Please wait a moment and try again.",
  },
});

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const SYSTEM_PROMPT =
  "You are a helpful assistant that explains figurative language, social situations, and conversations clearly and simply for autistic teens. Use plain language, be direct and specific, and avoid sarcasm or idioms in your explanations.";

router.get("/llm/health", (_req, res) => {
  const hasKey = Boolean(process.env.GROQ_API_KEY);
  res.json({ ready: hasKey, model: hasKey ? GROQ_MODEL : null });
});

router.post("/llm", llmLimiter, async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        success: false,
        error: "unauthenticated",
        response: "You must be logged in to use this tool.",
      });
      return;
    }

    const rawPrompt = req.body?.prompt;
    if (typeof rawPrompt !== "string" || rawPrompt.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "invalid_prompt",
        response: "Please provide a text prompt.",
      });
      return;
    }

    if (rawPrompt.length > MAX_PROMPT_LENGTH) {
      res.status(400).json({
        success: false,
        error: "prompt_too_long",
        response: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`,
      });
      return;
    }

    const userPrompt = rawPrompt.trim();

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      res.status(503).json({
        success: false,
        error: "no_api_key",
        response:
          "This tool uses AI to explain figurative language and social situations. To enable AI responses, add a GROQ_API_KEY secret in your Replit environment.",
      });
      return;
    }

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      req.log.error({ status: groqRes.status, body: errText }, "Groq API error");

      if (groqRes.status === 429) {
        res.status(429).json({
          success: false,
          error: "rate_limited",
          response: "The AI is busy right now. Please wait a moment and try again.",
        });
        return;
      }

      if (groqRes.status === 401) {
        res.status(401).json({
          success: false,
          error: "invalid_api_key",
          response: "The API key is not valid. Please check your GROQ_API_KEY secret.",
        });
        return;
      }

      res.status(502).json({
        success: false,
        error: "groq_error",
        response: "The AI service returned an error. Please try again in a moment.",
      });
      return;
    }

    const data = (await groqRes.json()) as {
      choices: { message: { content: string } }[];
    };
    const responseText = data.choices[0]?.message?.content;

    if (!responseText) {
      req.log.error({ data }, "Groq returned empty response");
      res.status(502).json({
        success: false,
        error: "empty_response",
        response: "The AI returned an empty response. Please try again.",
      });
      return;
    }

    res.json({ success: true, response: responseText });
  } catch (error) {
    req.log.error({ error }, "Error calling LLM");
    res.status(500).json({
      success: false,
      error: "request_failed",
      response: "Something went wrong. Please try again.",
    });
  }
});

export default router;
