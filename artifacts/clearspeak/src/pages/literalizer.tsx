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
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-100 p-8">
      <div className="bg-stone-50 shadow-md rounded-xl p-10 max-w-xl w-full border border-stone-200">
        <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm mb-4 block transition">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-2 text-slate-600">Fill‑in‑the‑Blank Literal Meaning Tool</h1>
        <p className="text-stone-500 mb-6 text-sm leading-relaxed">
          Enter a confusing phrase or expression, and we'll explain what it really means.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder='e.g. "It&apos;s raining cats and dogs"'
            className="border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white text-stone-700 placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={loading || !phrase.trim()}
            className="bg-slate-500 text-stone-100 py-3 rounded-lg hover:bg-slate-600 transition disabled:opacity-40 font-medium"
          >
            {loading ? "Thinking…" : "Explain this phrase"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg text-amber-700 text-sm border border-amber-200">{error}</div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg text-stone-600 whitespace-pre-wrap text-sm leading-relaxed border border-slate-200">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
