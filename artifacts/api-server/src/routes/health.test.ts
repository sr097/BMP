import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";

vi.mock("pino-http", () => ({
  default: () =>
    (_req: unknown, _res: unknown, next: () => void) => {
      next();
    },
}));

vi.mock("../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  },
}));

import healthRouter from "./health";

function createApp() {
  const app = express();
  app.use(healthRouter);
  return app;
}

describe("Health Route", () => {
  it("GET /healthz returns status ok", async () => {
    const app = createApp();
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /healthz response conforms to HealthCheckResponse schema", async () => {
    const app = createApp();
    const res = await request(app).get("/healthz");
    expect(res.body).toHaveProperty("status");
    expect(typeof res.body.status).toBe("string");
  });
});
