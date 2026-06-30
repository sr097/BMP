const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;

export const API_BASE = DOMAIN ? `https://${DOMAIN}/api` : "/api";

export interface LlmResponse {
  success: boolean;
  response: string;
  error?: string;
}

export async function callLlm(prompt: string): Promise<LlmResponse> {
  const res = await fetch(`${API_BASE}/llm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Partial<LlmResponse>;
    return {
      success: false,
      response: data.response ?? "Something went wrong. Please try again.",
      error: data.error,
    };
  }

  return res.json() as Promise<LlmResponse>;
}
