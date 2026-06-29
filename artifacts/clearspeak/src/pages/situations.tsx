import { useState } from "react";
import { Link } from "wouter";

const COMMON_SITUATIONS = [
  {
    title: "Someone says \"We should hang out sometime\"",
    explanation: "This usually means the person likes you and is being friendly, but they may not have a specific plan. It's often a polite way of saying they enjoy your company. You don't need to immediately set a date — you can say \"That sounds fun!\" and see if they follow up.",
  },
  {
    title: "A teacher says \"You might want to check your work\"",
    explanation: "This almost always means your work has mistakes. Teachers often soften criticism this way. You should go back and review what you did carefully.",
  },
  {
    title: "Someone says \"Whatever\" during an argument",
    explanation: "This usually means the person is frustrated and doesn't want to continue the conversation. It's not really about agreeing with you — they're signaling they want to stop talking about it.",
  },
  {
    title: "A friend says \"It's fine\" but seems upset",
    explanation: "When someone says \"it's fine\" but their tone or body language says otherwise, they may actually be upset but not ready to talk about it. Give them some space, and you can check in later.",
  },
  {
    title: "Someone says \"I'll think about it\"",
    explanation: "This could mean yes or no. Sometimes it means they genuinely need time to decide. Other times it's a polite way to say no without conflict. If it's important, it's okay to follow up once after a day or two.",
  },
];

export default function Situations() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [customResult, setCustomResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!custom.trim()) return;
    setLoading(true);
    setError("");
    setCustomResult("");
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `An autistic teen encountered this social situation: "${custom}"\n\nExplain clearly and simply:\n1. What is likely happening socially\n2. How the other person probably feels\n3. What would be a good response or action`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomResult(data.response);
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
    <main className="flex min-h-screen flex-col items-center bg-purple-50 p-8">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-xl w-full">
        <Link href="/" className="text-purple-500 hover:underline text-sm mb-4 block">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-2 text-purple-600">Common Situations &amp; Clear Explanations</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Tap a situation to see a clear explanation, or describe your own.
        </p>

        <div className="flex flex-col gap-3 mb-8">
          {COMMON_SITUATIONS.map((s, i) => (
            <div key={i} className="border border-purple-200 rounded-lg overflow-hidden">
              <button
                className="w-full text-left px-4 py-3 font-medium text-gray-800 hover:bg-purple-50 transition flex justify-between items-center"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <span>{s.title}</span>
                <span className="text-purple-400 ml-2">{expanded === i ? "▲" : "▼"}</span>
              </button>
              {expanded === i && (
                <div className="px-4 py-3 bg-purple-50 text-gray-700 text-sm leading-relaxed border-t border-purple-100">
                  {s.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        <hr className="my-6 border-purple-100" />

        <h2 className="text-lg font-semibold text-purple-600 mb-3">Describe your own situation</h2>
        <form onSubmit={handleCustom} className="flex flex-col gap-4">
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Describe a confusing social situation you experienced…"
            rows={3}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
          <button
            type="submit"
            disabled={loading || !custom.trim()}
            className="bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
          >
            {loading ? "Thinking…" : "Explain this situation"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        {customResult && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {customResult}
          </div>
        )}
      </div>
    </main>
  );
}
