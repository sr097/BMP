const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;

export const API_BASE = DOMAIN ? `https://${DOMAIN}/api` : "/api";

export interface LlmResponse {
  success: boolean;
  response: string;
  error?: string;
}

export async function callLlm(prompt: string): Promise<LlmResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/llm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
  } catch (err) {
    return {
      success: false,
      response:
        "Could not connect. Please check your connection and try again.",
      error: "network_error",
    };
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Partial<LlmResponse>;
    return {
      success: false,
      response:
        data.response ?? `Request failed (${res.status}). Please try again.`,
      error: data.error ?? "request_failed",
    };
  }

  try {
    return (await res.json()) as LlmResponse;
  } catch {
    return {
      success: false,
      response:
        "Received an invalid response from the server. Please try again.",
      error: "invalid_response",
    };
  }
}
