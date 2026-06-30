import { useState } from "react";
import { Link } from "wouter";

type Mode = "template" | "freetext";

const WHO_OPTIONS = [
  "a friend",
  "a classmate",
  "a teacher",
  "a coworker",
  "a boss or manager",
  "a parent or guardian",
  "a sibling",
  "someone I just met",
  "a group of people",
];

const FELT_OPTIONS = [
  "confusing or unclear",
  "rude or dismissive",
  "sarcastic or mean",
  "passive-aggressive",
  "hurtful",
  "cold or distant",
  "overwhelming",
  "embarrassing",
];

const WHERE_OPTIONS = [
  "at school",
  "at work",
  "at home",
  "in a group setting",
  "online or by text",
  "in front of other people",
];

const TYPE_OPTIONS = [
  "a vague or unclear response",
  "a hint or indirect request",
  "a criticism or complaint",
  "a confusing compliment",
  "an unexpected change of plans",
  "silence or being ignored",
  "an emotional outburst",
  "a short one-word or one-sentence reply",
];

function buildTemplatePrompt(
  who: string,
  felt: string,
  where: string,
  type: string,
  extra: string,
) {
  let prompt = `An autistic teen experienced a confusing social moment. Here are the details:\n\n`;
  prompt += `- The other person was: ${who}\n`;
  prompt += `- It happened: ${where}\n`;
  prompt += `- What they said/did felt: ${felt}\n`;
  prompt += `- The type of thing they said was: ${type}\n`;
  if (extra.trim()) prompt += `- Extra context: ${extra}\n`;
  prompt += `\nPlease break this down clearly:\n1. What the person probably meant (not just what they said)\n2. The tone and hidden emotions behind it\n3. Any unspoken social rules or expectations at play\n4. Suggested ways to respond or what to do next`;
  return prompt;
}

export default function ConversationHelper() {
  const [mode, setMode] = useState<Mode>("template");

  const [who, setWho] = useState("");
  const [felt, setFelt] = useState("");
  const [where, setWhere] = useState("");
  const [type, setType] = useState("");
  const [extra, setExtra] = useState("");

  const [conversation, setConversation] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const templateReady = who && felt && where && type;

  async function callApi(prompt: string) {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.response || `Request failed (${res.status}). Please try again.`,
        );
        return;
      }
      const data = await res.json();
      if (data.success) {
        setResult(data.response);
      } else {
        setError(data.response || "Something went wrong. Please try again.");
      }
    } catch {
      setError(
        "Could not connect. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!templateReady) return;
    callApi(buildTemplatePrompt(who, felt, where, type, extra));
  }

  function handleFreeText(e: React.FormEvent) {
    e.preventDefault();
    if (!conversation.trim()) return;
    callApi(
      `An autistic teen is confused by this conversation or exchange:\n\n"${conversation}"\n\nPlease break it down clearly:\n1. What each person probably meant (not just what they said)\n2. What emotions or intentions were likely behind the words\n3. Any hidden social rules or expectations at play\n4. Suggested ways to respond or what to do next`,
    );
  }

  function switchMode(m: Mode) {
    setMode(m);
    setResult("");
    setError("");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-50 p-8">
      <div className="bg-white shadow-sm rounded-xl p-10 max-w-xl w-full border border-emerald-100">
        <Link
          href="/"
          className="text-emerald-400 hover:text-emerald-600 text-sm mb-4 block transition"
        >
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-1 text-emerald-700">
          Conversation Breakdown Helper
        </h1>
        <p className="text-slate-500 mb-2 text-sm leading-relaxed">
          We'll explain the tone, hidden emotions, and what to do next.
        </p>

        <div className="flex rounded-lg overflow-hidden border border-emerald-200 mb-6 mt-4">
          <button
            onClick={() => switchMode("template")}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              mode === "template"
                ? "bg-emerald-500 text-white"
                : "bg-white text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            🔒 Fill-in-the-Blank
          </button>
          <button
            onClick={() => switchMode("freetext")}
            className={`flex-1 py-2.5 text-sm font-medium transition border-l border-emerald-200 ${
              mode === "freetext"
                ? "bg-emerald-500 text-white"
                : "bg-white text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            ✏️ Type it Out
          </button>
        </div>

        {mode === "template" ? (
          <>
            <p className="text-xs text-slate-400 mb-4 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 leading-relaxed">
              🔒 <strong>Privacy-safe:</strong> No names or private details
              needed — just pick what fits.
            </p>
            <form onSubmit={handleTemplate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  The person was…
                </label>
                <select
                  value={who}
                  onChange={(e) => setWho(e.target.value)}
                  className="w-full border-2 border-emerald-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm"
                >
                  <option value="">Select…</option>
                  {WHO_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  It happened…
                </label>
                <select
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  className="w-full border-2 border-emerald-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm"
                >
                  <option value="">Select…</option>
                  {WHERE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  What they said/did felt…
                </label>
                <select
                  value={felt}
                  onChange={(e) => setFelt(e.target.value)}
                  className="w-full border-2 border-emerald-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm"
                >
                  <option value="">Select…</option>
                  {FELT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  The type of thing they said was…
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border-2 border-emerald-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm"
                >
                  <option value="">Select…</option>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Anything else?{" "}
                  <span className="text-slate-400 font-normal normal-case">
                    (optional — no names needed)
                  </span>
                </label>
                <input
                  type="text"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder="e.g. they seemed annoyed but said everything was fine"
                  className="w-full border-2 border-emerald-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-center mt-1">
                <button
                  type="submit"
                  disabled={loading || !templateReady}
                  className="bg-emerald-600 text-white px-10 py-4 rounded-xl hover:bg-emerald-700 transition disabled:opacity-40 font-semibold text-base shadow-sm"
                >
                  {loading ? "Breaking it down…" : "Break down this situation"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 leading-relaxed">
              ✏️ Type or paste a conversation. You can use fake names or leave
              names out entirely.
            </p>
            <form onSubmit={handleFreeText} className="flex flex-col gap-5">
              <textarea
                value={conversation}
                onChange={(e) => setConversation(e.target.value)}
                placeholder={
                  'Example:\nFriend: "Fine, whatever."\nMe: "Are you sure?"\nFriend: "Yes, it\'s fine." (but seemed upset)'
                }
                rows={5}
                className="border-2 border-emerald-200 shadow-md rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none font-mono text-sm bg-white text-slate-700 placeholder:text-slate-400"
              />
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading || !conversation.trim()}
                  className="bg-emerald-600 text-white px-10 py-4 rounded-xl hover:bg-emerald-700 transition disabled:opacity-40 font-semibold text-base shadow-sm"
                >
                  {loading
                    ? "Breaking it down…"
                    : "Break down this conversation"}
                </button>
              </div>
            </form>
          </>
        )}

        {error && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg text-amber-700 text-sm border border-amber-200">
            {error}
          </div>
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
