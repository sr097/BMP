import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

vi.mock("@workspace/db", () => {
  const mockInsert = vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ sid: "test-sid" }]),
      }),
    }),
  });
  const mockSelect = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  });
  const mockDelete = vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  });
  const mockUpdate = vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  });

  return {
    db: {
      insert: mockInsert,
      select: mockSelect,
      delete: mockDelete,
      update: mockUpdate,
    },
    sessionsTable: { sid: "sid", sess: "sess", expire: "expire" },
    usersTable: { id: "id" },
  };
});

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

vi.mock("openid-client", () => ({
  discovery: vi.fn(),
}));

import {
  getSessionId,
  clearSession,
  SESSION_COOKIE,
  SESSION_TTL,
  ISSUER_URL,
} from "./auth";

describe("Auth Library", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSessionId", () => {
    it("extracts session ID from Bearer authorization header", () => {
      const req = {
        headers: { authorization: "Bearer my-session-token" },
        cookies: {},
      } as unknown as Request;

      expect(getSessionId(req)).toBe("my-session-token");
    });

    it("extracts session ID from cookie when no auth header", () => {
      const req = {
        headers: {},
        cookies: { [SESSION_COOKIE]: "cookie-session-id" },
      } as unknown as Request;

      expect(getSessionId(req)).toBe("cookie-session-id");
    });

    it("prefers authorization header over cookie", () => {
      const req = {
        headers: { authorization: "Bearer header-token" },
        cookies: { [SESSION_COOKIE]: "cookie-token" },
      } as unknown as Request;

      expect(getSessionId(req)).toBe("header-token");
    });

    it("returns undefined when neither header nor cookie present", () => {
      const req = {
        headers: {},
        cookies: {},
      } as unknown as Request;

      expect(getSessionId(req)).toBeUndefined();
    });

    it("returns undefined for non-Bearer auth header", () => {
      const req = {
        headers: { authorization: "Basic dXNlcjpwYXNz" },
        cookies: {},
      } as unknown as Request;

      expect(getSessionId(req)).toBeUndefined();
    });

    it("returns undefined when cookies is undefined", () => {
      const req = {
        headers: {},
      } as unknown as Request;

      expect(getSessionId(req)).toBeUndefined();
    });
  });

  describe("clearSession", () => {
    it("clears the session cookie", async () => {
      const res = {
        clearCookie: vi.fn(),
      } as unknown as Response;

      await clearSession(res);
      expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE, {
        path: "/",
      });
    });

    it("deletes session from DB when sid is provided", async () => {
      const { db } = await import("@workspace/db");
      const res = {
        clearCookie: vi.fn(),
      } as unknown as Response;

      await clearSession(res, "session-to-delete");
      expect(db.delete).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE, {
        path: "/",
      });
    });

    it("does not call delete when sid is undefined", async () => {
      const { db } = await import("@workspace/db");
      const mockDelete = vi.mocked(db.delete);
      mockDelete.mockClear();

      const res = {
        clearCookie: vi.fn(),
      } as unknown as Response;

      await clearSession(res, undefined);
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe("constants", () => {
    it("SESSION_COOKIE is 'sid'", () => {
      expect(SESSION_COOKIE).toBe("sid");
    });

    it("SESSION_TTL is 7 days in milliseconds", () => {
      expect(SESSION_TTL).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it("ISSUER_URL defaults to Replit OIDC", () => {
      expect(ISSUER_URL).toContain("replit.com/oidc");
    });
  });
});
