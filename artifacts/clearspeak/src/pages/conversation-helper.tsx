import { useState } from "react";
import { Link } from "wouter";

export default function ConversationHelper() {
  const [conversation, setConversation] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!conversation.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `An autistic teen is confused by this conversation or exchange:\n\n"${conversation}"\n\nPlease break it down clearly:\n1. What each person probably meant (not just what they said)\n2. What emotions or intentions were likely behind the words\n3. Any hidden social rules or expectations at play\n4. Suggested ways to respond or what to do next`,
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-50 p-8">
      <div className="bg-white shadow-sm rounded-xl p-10 max-w-xl w-full border border-emerald-100">
        <Link href="/" className="text-emerald-400 hover:text-emerald-600 text-sm mb-4 block transition">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-2 text-emerald-700">Conversation Breakdown Helper</h1>
        <p className="text-slate-500 mb-4 text-sm leading-relaxed">
          Paste or type a conversation that confused you. We'll explain:
        </p>
        <ul className="mb-6 space-y-1 text-sm text-slate-500">
          <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">●</span> What each person <span className="font-medium text-slate-600 mx-1">actually meant</span> (not just what they said)</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">●</span> The <span className="font-medium text-slate-600 mx-1">tone and hidden emotions</span> behind the words</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">●</span> Any <span className="font-medium text-slate-600 mx-1">unspoken social rules</span> at play</li>
          <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">●</span> Suggested <span className="font-medium text-slate-600 mx-1">ways to respond</span> or what to do next</li>
        </ul>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <textarea
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            placeholder={'Example:\nFriend: "Fine, whatever."\nMe: "Are you sure?"\nFriend: "Yes, it\'s fine." (but seemed upset)'}
            rows={5}
            className="border-2 border-emerald-200 shadow-md rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none font-mono text-sm bg-white text-slate-700 placeholder:text-slate-400"
          />
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || !conversation.trim()}
              className="bg-emerald-600 text-white px-10 py-4 rounded-xl hover:bg-emerald-700 transition disabled:opacity-40 font-semibold text-base shadow-sm"
            >
              {loading ? "Breaking it down…" : "Break down this conversation"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg text-amber-700 text-sm border border-amber-200">{error}</div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg text-slate-600 whitespace-pre-wrap text-sm leading-relaxed border border-emerald-200">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
