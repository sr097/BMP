import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  },
}));

vi.mock("pino-http", () => ({
  default: () =>
    (_req: unknown, _res: unknown, next: () => void) => {
      next();
    },
}));

import llmRouter from "./llm";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.log = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as typeof req.log;
    next();
  });
  app.use(llmRouter);
  return app;
}

describe("LLM Routes", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("GET /llm/health", () => {
    it("returns ready: false when GROQ_API_KEY is not set", async () => {
      delete process.env.GROQ_API_KEY;
      const app = createApp();
      const res = await request(app).get("/llm/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ready: false, model: null });
    });

    it("returns ready: true with model name when GROQ_API_KEY is set", async () => {
      process.env.GROQ_API_KEY = "test-key";
      const app = createApp();
      const res = await request(app).get("/llm/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ready: true,
        model: "llama-3.3-70b-versatile",
      });
    });
  });

  describe("POST /llm", () => {
    it("returns 503 when GROQ_API_KEY is not set", async () => {
      delete process.env.GROQ_API_KEY;
      const app = createApp();
      const res = await request(app)
        .post("/llm")
        .send({ prompt: "Hello" });
      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("no_api_key");
    });

    it("returns success with AI response on valid Groq call", async () => {
      process.env.GROQ_API_KEY = "test-key";
      const mockResponse = {
        choices: [{ message: { content: "Test AI response" } }],
      };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        }),
      );

      const app = createApp();
      const res = await request(app)
        .post("/llm")
        .send({ prompt: "What does 'break a leg' mean?" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, response: "Test AI response" });
    });

    it("uses default prompt when none provided", async () => {
      process.env.GROQ_API_KEY = "test-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Hello response" } }],
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const app = createApp();
      await request(app).post("/llm").send({});

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.messages[1].content).toBe("Hello!");
    });

    it("returns 429 when Groq rate limits", async () => {
      process.env.GROQ_API_KEY = "test-key";
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          text: () => Promise.resolve("Rate limited"),
        }),
      );

      const app = createApp();
      const res = await request(app)
        .post("/llm")
        .send({ prompt: "test" });

      expect(res.status).toBe(429);
      expect(res.body.error).toBe("rate_limited");
    });

    it("returns 401 when API key is invalid", async () => {
      process.env.GROQ_API_KEY = "invalid-key";
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          text: () => Promise.resolve("Unauthorized"),
        }),
      );

      const app = createApp();
      const res = await request(app)
        .post("/llm")
        .send({ prompt: "test" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("invalid_api_key");
    });

    it("returns 502 on other Groq API errors", async () => {
      process.env.GROQ_API_KEY = "test-key";
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Internal Server Error"),
        }),
      );

      const app = createApp();
      const res = await request(app)
        .post("/llm")
        .send({ prompt: "test" });

      expect(res.status).toBe(502);
      expect(res.body.error).toBe("groq_error");
    });

    it("returns 502 when Groq returns empty response", async () => {
      process.env.GROQ_API_KEY = "test-key";
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ choices: [{ message: { content: "" } }] }),
        }),
      );

      const app = createApp();
      const res = await request(app)
        .post("/llm")
        .send({ prompt: "test" });

      expect(res.status).toBe(502);
      expect(res.body.error).toBe("empty_response");
    });

    it("returns 502 when Groq returns no choices", async () => {
      process.env.GROQ_API_KEY = "test-key";
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ choices: [] }),
        }),
      );

      const app = createApp();
      const res = await request(app)
        .post("/llm")
        .send({ prompt: "test" });

      expect(res.status).toBe(502);
      expect(res.body.error).toBe("empty_response");
    });

    it("returns 500 when fetch throws an exception", async () => {
      process.env.GROQ_API_KEY = "test-key";
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Network error")),
      );

      const app = createApp();
      const res = await request(app)
        .post("/llm")
        .send({ prompt: "test" });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("request_failed");
    });

    it("sends correct headers and body to Groq API", async () => {
      process.env.GROQ_API_KEY = "my-api-key";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "response" } }],
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const app = createApp();
      await request(app)
        .post("/llm")
        .send({ prompt: "explain this" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.groq.com/openai/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer my-api-key",
            "Content-Type": "application/json",
          },
        }),
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe("llama-3.3-70b-versatile");
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe("system");
      expect(body.messages[1]).toEqual({
        role: "user",
        content: "explain this",
      });
      expect(body.max_tokens).toBe(500);
    });
  });
});
