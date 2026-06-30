import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

const mockGetSession = vi.fn();
const mockGetSessionId = vi.fn();
const mockClearSession = vi.fn();
const mockUpdateSession = vi.fn();
const mockGetOidcConfig = vi.fn();

vi.mock("../lib/auth", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
  getSessionId: (...args: unknown[]) => mockGetSessionId(...args),
  clearSession: (...args: unknown[]) => mockClearSession(...args),
  updateSession: (...args: unknown[]) => mockUpdateSession(...args),
  getOidcConfig: (...args: unknown[]) => mockGetOidcConfig(...args),
  SESSION_COOKIE: "sid",
  SESSION_TTL: 7 * 24 * 60 * 60 * 1000,
}));

vi.mock("openid-client", () => ({
  refreshTokenGrant: vi.fn(),
}));

import { authMiddleware } from "./authMiddleware";

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    cookies: {},
    ...overrides,
  } as unknown as Request;
}

function createMockRes(): Response {
  return {
    clearCookie: vi.fn(),
    cookie: vi.fn(),
  } as unknown as Response;
}

describe("authMiddleware", () => {
  let next: NextFunction;

  beforeEach(() => {
    vi.restoreAllMocks();
    next = vi.fn();
    mockGetSession.mockReset();
    mockGetSessionId.mockReset();
    mockClearSession.mockReset();
    mockUpdateSession.mockReset();
    mockGetOidcConfig.mockReset();
  });

  it("adds isAuthenticated method to request", async () => {
    mockGetSessionId.mockReturnValue(undefined);
    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(req.isAuthenticated).toBeDefined();
    expect(typeof req.isAuthenticated).toBe("function");
  });

  it("calls next() when no session ID exists", async () => {
    mockGetSessionId.mockReturnValue(undefined);
    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("clears session and calls next() when session not found in DB", async () => {
    mockGetSessionId.mockReturnValue("expired-sid");
    mockGetSession.mockResolvedValue(null);
    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(mockClearSession).toHaveBeenCalledWith(res, "expired-sid");
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("clears session when session has no user ID", async () => {
    mockGetSessionId.mockReturnValue("bad-sid");
    mockGetSession.mockResolvedValue({ user: { id: "" } });
    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(mockClearSession).toHaveBeenCalledWith(res, "bad-sid");
    expect(next).toHaveBeenCalled();
  });

  it("sets req.user when session is valid and not expired", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      profileImageUrl: null,
    };
    const sessionData = {
      user: mockUser,
      access_token: "token",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };
    mockGetSessionId.mockReturnValue("valid-sid");
    mockGetSession.mockResolvedValue(sessionData);

    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("isAuthenticated returns true when user is set", async () => {
    const sessionData = {
      user: { id: "user-1", email: null, firstName: null, lastName: null, profileImageUrl: null },
      access_token: "token",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };
    mockGetSessionId.mockReturnValue("sid");
    mockGetSession.mockResolvedValue(sessionData);

    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(req.isAuthenticated()).toBe(true);
  });

  it("isAuthenticated returns false when user is not set", async () => {
    mockGetSessionId.mockReturnValue(undefined);

    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(req.isAuthenticated()).toBe(false);
  });

  it("clears session when token is expired and no refresh token", async () => {
    const sessionData = {
      user: { id: "user-1", email: null, firstName: null, lastName: null, profileImageUrl: null },
      access_token: "token",
      expires_at: Math.floor(Date.now() / 1000) - 3600,
    };
    mockGetSessionId.mockReturnValue("expired-sid");
    mockGetSession.mockResolvedValue(sessionData);

    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(mockClearSession).toHaveBeenCalledWith(res, "expired-sid");
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it("refreshes token when expired and refresh_token is available", async () => {
    const mockUser = {
      id: "user-1",
      email: null,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
    };
    const sessionData = {
      user: mockUser,
      access_token: "old-token",
      refresh_token: "refresh-token",
      expires_at: Math.floor(Date.now() / 1000) - 3600,
    };
    mockGetSessionId.mockReturnValue("sid");
    mockGetSession.mockResolvedValue(sessionData);
    mockGetOidcConfig.mockResolvedValue({});

    const { refreshTokenGrant } = await import("openid-client");
    vi.mocked(refreshTokenGrant).mockResolvedValue({
      access_token: "new-token",
      refresh_token: "new-refresh",
      expiresIn: () => 3600,
    } as unknown as ReturnType<typeof refreshTokenGrant> extends Promise<infer T> ? T : never);

    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(mockUpdateSession).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("clears session when token refresh fails", async () => {
    const sessionData = {
      user: { id: "user-1", email: null, firstName: null, lastName: null, profileImageUrl: null },
      access_token: "old-token",
      refresh_token: "bad-refresh",
      expires_at: Math.floor(Date.now() / 1000) - 3600,
    };
    mockGetSessionId.mockReturnValue("sid");
    mockGetSession.mockResolvedValue(sessionData);
    mockGetOidcConfig.mockResolvedValue({});

    const { refreshTokenGrant } = await import("openid-client");
    vi.mocked(refreshTokenGrant).mockRejectedValue(new Error("refresh failed"));

    const req = createMockReq();
    const res = createMockRes();

    await authMiddleware(req, res, next);

    expect(mockClearSession).toHaveBeenCalledWith(res, "sid");
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
