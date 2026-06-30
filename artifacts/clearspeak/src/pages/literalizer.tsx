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
    <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50 p-8">
      <div className="bg-white shadow-sm rounded-xl p-10 max-w-xl w-full border border-sky-100">
        <Link href="/" className="text-sky-400 hover:text-sky-600 text-sm mb-4 block transition">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-2 text-sky-700">Fill‑in‑the‑Blank Literal Meaning Tool</h1>
        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
          Enter a confusing phrase or expression, and we'll explain what it really means.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder='e.g. "It&apos;s raining cats and dogs"'
            className="border border-sky-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-300 bg-sky-50 text-slate-700 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !phrase.trim()}
            className="bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600 transition disabled:opacity-40 font-medium"
          >
            {loading ? "Thinking…" : "Explain this phrase"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg text-amber-700 text-sm border border-amber-200">{error}</div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-sky-50 rounded-lg text-slate-600 whitespace-pre-wrap text-sm leading-relaxed border border-sky-200">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
