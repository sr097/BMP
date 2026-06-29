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
    <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-8">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-xl w-full">
        <Link href="/" className="text-green-500 hover:underline text-sm mb-4 block">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-2 text-green-600">Conversation Breakdown Helper</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Paste or type a conversation that confused you, and we'll break it down clearly.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            placeholder={'Example:\nFriend: "Fine, whatever."\nMe: "Are you sure?"\nFriend: "Yes, it\'s fine." (but seemed upset)'}
            rows={5}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none font-mono text-sm"
          />
          <button
            type="submit"
            disabled={loading || !conversation.trim()}
            className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "Breaking it down…" : "Break down this conversation"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
