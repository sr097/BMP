import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  customFetch,
  setBaseUrl,
  setAuthTokenGetter,
  ApiError,
  ResponseParseError,
} from "./custom-fetch";

describe("custom-fetch", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    setBaseUrl(null);
    setAuthTokenGetter(null);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("setBaseUrl", () => {
    it("prepends base URL to relative paths", async () => {
      setBaseUrl("https://api.example.com");
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/test",
        expect.anything(),
      );
    });

    it("does not modify absolute URLs", async () => {
      setBaseUrl("https://api.example.com");
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("https://other.com/api/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://other.com/api/test",
        expect.anything(),
      );
    });

    it("strips trailing slash from base URL", async () => {
      setBaseUrl("https://api.example.com/");
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: 1 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/endpoint");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/endpoint",
        expect.anything(),
      );
    });

    it("clears base URL when null is passed", async () => {
      setBaseUrl("https://api.example.com");
      setBaseUrl(null);
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("", { status: 200 }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.anything(),
      );
    });
  });

  describe("setAuthTokenGetter", () => {
    it("attaches Bearer token when getter returns a string", async () => {
      setAuthTokenGetter(() => "my-token");
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test");

      const [, opts] = mockFetch.mock.calls[0];
      const headers = new Headers(opts.headers);
      expect(headers.get("authorization")).toBe("Bearer my-token");
    });

    it("does not attach token when getter returns null", async () => {
      setAuthTokenGetter(() => null);
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("", { status: 200 }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test");

      const [, opts] = mockFetch.mock.calls[0];
      const headers = new Headers(opts.headers);
      expect(headers.get("authorization")).toBeNull();
    });

    it("does not override explicitly provided Authorization header", async () => {
      setAuthTokenGetter(() => "auto-token");
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("", { status: 200 }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test", {
        headers: { Authorization: "Bearer manual-token" },
      });

      const [, opts] = mockFetch.mock.calls[0];
      const headers = new Headers(opts.headers);
      expect(headers.get("authorization")).toBe("Bearer manual-token");
    });

    it("supports async token getters", async () => {
      setAuthTokenGetter(async () => "async-token");
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("", { status: 200 }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test");

      const [, opts] = mockFetch.mock.calls[0];
      const headers = new Headers(opts.headers);
      expect(headers.get("authorization")).toBe("Bearer async-token");
    });
  });

  describe("method resolution", () => {
    it("defaults to GET when no method specified", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("", { status: 200 }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test");

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.method).toBe("GET");
    });

    it("uses explicitly specified method", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("", { status: 200 }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test", { method: "post" });

      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.method).toBe("POST");
    });

    it("throws TypeError for GET with body", async () => {
      await expect(
        customFetch("/api/test", { method: "GET", body: "data" }),
      ).rejects.toThrow(TypeError);
    });

    it("throws TypeError for HEAD with body", async () => {
      await expect(
        customFetch("/api/test", { method: "HEAD", body: "data" }),
      ).rejects.toThrow(TypeError);
    });
  });

  describe("content-type inference", () => {
    it("sets content-type to application/json for JSON-like string body", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("", { status: 200 }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test", {
        method: "POST",
        body: '{"key": "value"}',
      });

      const [, opts] = mockFetch.mock.calls[0];
      const headers = new Headers(opts.headers);
      expect(headers.get("content-type")).toBe("application/json");
    });

    it("does not override explicit content-type", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("", { status: 200 }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test", {
        method: "POST",
        body: '{"key": "value"}',
        headers: { "Content-Type": "text/plain" },
      });

      const [, opts] = mockFetch.mock.calls[0];
      const headers = new Headers(opts.headers);
      expect(headers.get("content-type")).toBe("text/plain");
    });
  });

  describe("response parsing", () => {
    it("parses JSON response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ name: "test" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const result = await customFetch<{ name: string }>("/api/test");
      expect(result).toEqual({ name: "test" });
    });

    it("returns null for 204 No Content", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(null, { status: 204 }),
      );

      const result = await customFetch("/api/test", { method: "DELETE" });
      expect(result).toBeNull();
    });

    it("returns null for content-length: 0", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response("", {
          status: 200,
          headers: { "content-length": "0" },
        }),
      );

      const result = await customFetch("/api/test");
      expect(result).toBeNull();
    });

    it("handles text response type", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response("hello world", {
          status: 200,
          headers: { "content-type": "text/plain" },
        }),
      );

      const result = await customFetch("/api/test", { responseType: "text" });
      expect(result).toBe("hello world");
    });

    it("strips BOM from JSON response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response("\ufeff" + JSON.stringify({ bom: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const result = await customFetch<{ bom: boolean }>("/api/test", {
        responseType: "json",
      });
      expect(result).toEqual({ bom: true });
    });
  });

  describe("error handling", () => {
    it("throws ApiError for non-ok responses", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Not Found" }), {
          status: 404,
          statusText: "Not Found",
          headers: { "content-type": "application/json" },
        }),
      );

      await expect(customFetch("/api/test")).rejects.toThrow(ApiError);
    });

    it("ApiError contains status and data", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          statusText: "Forbidden",
          headers: { "content-type": "application/json" },
        }),
      );

      try {
        await customFetch("/api/test");
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        const err = e as ApiError;
        expect(err.status).toBe(403);
        expect(err.statusText).toBe("Forbidden");
        expect(err.data).toEqual({ error: "forbidden" });
        expect(err.method).toBe("GET");
      }
    });

    it("ApiError message includes detail field", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Resource not found" }), {
          status: 404,
          statusText: "Not Found",
          headers: { "content-type": "application/json" },
        }),
      );

      try {
        await customFetch("/api/test");
      } catch (e) {
        const err = e as ApiError;
        expect(err.message).toContain("Resource not found");
      }
    });

    it("throws ResponseParseError for invalid JSON with json responseType", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response("not valid json{", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      await expect(
        customFetch("/api/test", { responseType: "json" }),
      ).rejects.toThrow(ResponseParseError);
    });

    it("ApiError message includes title and detail for problem+json", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ title: "Validation Error", detail: "Name is required" }),
          {
            status: 422,
            statusText: "Unprocessable Entity",
            headers: { "content-type": "application/problem+json" },
          },
        ),
      );

      try {
        await customFetch("/api/test");
      } catch (e) {
        const err = e as ApiError;
        expect(err.message).toContain("Validation Error");
        expect(err.message).toContain("Name is required");
      }
    });
  });

  describe("responseType: json accept header", () => {
    it("sets accept header for json responseType", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
      globalThis.fetch = mockFetch;

      await customFetch("/api/test", { responseType: "json" });

      const [, opts] = mockFetch.mock.calls[0];
      const headers = new Headers(opts.headers);
      expect(headers.get("accept")).toBe(
        "application/json, application/problem+json",
      );
    });
  });
});
