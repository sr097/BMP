import { useState } from "react";
import { Link } from "wouter";

export default function Literalizer() {
  const [phrase, setPhrase] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phrase.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `A teen with autism is trying to understand this figurative phrase: "${phrase}"\n\nExplain what it LITERALLY means versus what it ACTUALLY means in plain, simple language. Format your answer clearly with two parts:\n1. What it sounds like it means (literally)\n2. What it actually means`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.response);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50 p-8">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-xl w-full">
        <Link href="/" className="text-blue-500 hover:underline text-sm mb-4 block">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-2 text-blue-600">Fill‑in‑the‑Blank Literal Meaning Tool</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Enter a confusing phrase or expression, and we'll explain what it really means.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="e.g. &quot;It&apos;s raining cats and dogs&quot;"
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading || !phrase.trim()}
            className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Thinking…" : "Explain this phrase"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
