import { useState } from "react";
import { Link } from "wouter";

const COMMON_SITUATIONS = [
  {
    category: "At School",
    title: 'A teacher says "See me after class"',
    explanation:
      "This can feel scary, but it doesn't always mean you're in trouble. Teachers say this for lots of reasons — to check in, give feedback, or even say something positive. Take a breath. If you're anxious, it's okay to ask a trusted adult to come with you or wait outside.",
  },
  {
    category: "At School",
    title: 'A teacher asks "Does everyone understand?" but you don\'t',
    explanation:
      "Most people who don't understand stay quiet because they're embarrassed — but the teacher is asking because they want to help. You can raise your hand, or wait and ask after class: \"I didn't quite get that part — could you explain it again?\" That's not a sign of being slow; it's being responsible.",
  },
  {
    category: "At School",
    title: "You're put in a group project but nobody includes you",
    explanation:
      'This is really uncomfortable, and it\'s not your fault. Try starting with a small, easy question like "What part should I do?" If the group still leaves you out, it\'s completely okay to tell your teacher: "I\'m having trouble finding a role in my group." Teachers can help fix this.',
  },
  {
    category: "At School",
    title: 'A classmate says "Good job" but it felt sarcastic',
    explanation:
      "It can be hard to tell. Look for clues: did they smile genuinely? Was their voice flat or exaggerated? If you're genuinely unsure, assume it was sincere — most of the time it is. If unkind comments keep happening, talk to a trusted adult at school.",
  },
  {
    category: "With Friends",
    title: 'A friend says "Fine, whatever" and goes quiet',
    explanation:
      '"Fine" and "whatever" often mean the opposite — they\'re probably upset but don\'t know how to say it. Don\'t push them to talk right away. Give it some time, then check in gently: "Hey, I just want to make sure we\'re okay." That shows you care without putting pressure on them.',
  },
  {
    category: "With Friends",
    title: "You weren't invited to something but saw it on social media",
    explanation:
      "This hurts, and your feelings are valid. It doesn't automatically mean they dislike you — sometimes groups are small, or it was a spontaneous thing. If it keeps happening with the same people, it may be worth finding others who include you more consistently. You deserve to feel included.",
  },
  {
    category: "With Friends",
    title: 'Someone says "We should hang out sometime" but never follows up',
    explanation:
      "This usually means they like you but aren't the type to make plans. It's not a rejection — it's just vague friendliness. If you want to hang out, it's okay to suggest something specific: \"Want to come over Saturday?\" Taking the initiative isn't weird; it's how friendships actually happen.",
  },
  {
    category: "With Friends",
    title: "A friend suddenly seems distant and texts you less",
    explanation:
      'This is confusing and can feel personal. But people pull back for all kinds of reasons that have nothing to do with you — stress, family stuff, their own mental health. Give it a little time. If it keeps up, a simple "Hey, haven\'t talked in a while — are you okay?" goes a long way.',
  },
  {
    category: "Online & Texting",
    title: "Someone leaves you on read (they saw it but didn't reply)",
    explanation:
      'This almost never means what it feels like. People forget, get distracted, see a message and mean to reply later, or feel unsure what to say. It\'s okay to follow up once after a day or two: "Hey, just checking if you saw this!" If they consistently ignore you, that tells you something too.',
  },
  {
    category: "Online & Texting",
    title: 'A friend replies with just "k" or "lol"',
    explanation:
      "Short replies usually mean they're busy, distracted, or not a big texter — not that they're upset with you. \"K\" is rarely mean; it's just quick. If you need a real conversation, try asking a direct question they'd need to actually answer, or suggest talking in person or on a call.",
  },
  {
    category: "Online & Texting",
    title: "A group chat goes quiet right after you send something",
    explanation:
      "This feels awful but almost always has a boring explanation — people were busy, someone changed the subject in another chat, or they just didn't know what to add. It's very rarely because of what you said. Try not to overthink it or send follow-up messages asking if something's wrong.",
  },
  {
    category: "At Home",
    title: 'A parent says "We\'ll see" when you ask for something',
    explanation:
      "\"We'll see\" usually means \"I'm not saying no, but I'm not ready to say yes.\" It's not a promise and not a rejection — it's a pause. The best move is to bring it up again later with more information, like showing you've thought it through: \"I looked into it and here's how it would work…\"",
  },
  {
    category: "At Home",
    title: 'Someone says "Don\'t worry about it" when you are worried',
    explanation:
      "They're trying to reassure you, but it can feel dismissing. They may not realize how much it's bothering you. It's okay to say: \"I know you want me to feel better, but can we talk about it for a minute? I need to understand it to stop worrying.\" Most people will respond to that.",
  },
  {
    category: "At Home",
    title: "You're told \"You're too sensitive\"",
    explanation:
      "Being sensitive is not a flaw. Your feelings are real. When someone says this, they usually mean \"I'm uncomfortable with the amount of emotion right now\" — which is their limit, not yours. If you're hurting, it's okay to step away and process it somewhere safe. Your reactions make sense.",
  },
];

const CATEGORY_COLORS: Record<
  string,
  { border: string; bg: string; header: string; chevron: string; hover: string }
> = {
  "At School": {
    border: "border-sky-200",
    bg: "bg-sky-50",
    header: "text-sky-600",
    chevron: "text-sky-400",
    hover: "hover:bg-sky-50",
  },
  "With Friends": {
    border: "border-teal-200",
    bg: "bg-teal-50",
    header: "text-teal-600",
    chevron: "text-teal-400",
    hover: "hover:bg-teal-50",
  },
  "Online & Texting": {
    border: "border-cyan-200",
    bg: "bg-cyan-50",
    header: "text-cyan-600",
    chevron: "text-cyan-400",
    hover: "hover:bg-cyan-50",
  },
  "At Home": {
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    header: "text-indigo-600",
    chevron: "text-indigo-400",
    hover: "hover:bg-indigo-50",
  },
};

export default function Situations() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [customResult, setCustomResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = Array.from(
    new Set(COMMON_SITUATIONS.map((s) => s.category)),
  );

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
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.response || `Request failed (${res.status}). Please try again.`,
        );
        return;
      }
      const data = await res.json();
      if (data.success) {
        setCustomResult(data.response);
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

  return (
    <main className="flex min-h-screen flex-col items-center bg-teal-50 p-8">
      <div className="bg-white shadow-sm rounded-xl p-10 max-w-xl w-full border border-teal-100">
        <Link
          href="/"
          className="text-teal-400 hover:text-teal-600 text-sm mb-4 block transition"
        >
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-2 text-teal-700">
          Common Situations &amp; Clear Explanations
        </h1>
        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
          Tap a situation to see a clear explanation, or describe your own.
        </p>

        <div className="flex flex-col gap-6 mb-8">
          {categories.map((cat) => {
            const colors =
              CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Social Situations"];
            const items = COMMON_SITUATIONS.map((s, i) => ({ ...s, i })).filter(
              (s) => s.category === cat,
            );
            return (
              <div key={cat}>
                <h2
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${colors.header}`}
                >
                  {cat}
                </h2>
                <div className="flex flex-col gap-2">
                  {items.map(({ title, explanation, i }) => (
                    <div
                      key={i}
                      className={`border ${colors.border} rounded-lg overflow-hidden`}
                    >
                      <button
                        className={`w-full text-left px-4 py-3 font-medium text-stone-700 ${colors.hover} transition flex justify-between items-center`}
                        onClick={() => setExpanded(expanded === i ? null : i)}
                      >
                        <span className="pr-2">{title}</span>
                        <span className={`${colors.chevron} ml-2 shrink-0`}>
                          {expanded === i ? "▲" : "▼"}
                        </span>
                      </button>
                      {expanded === i && (
                        <div
                          className={`px-4 py-3 ${colors.bg} text-stone-600 text-sm leading-relaxed border-t ${colors.border}`}
                        >
                          {explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <hr className="my-6 border-teal-100" />

        <h2 className="text-lg font-semibold text-teal-700 mb-3">
          Describe your own situation
        </h2>
        <form onSubmit={handleCustom} className="flex flex-col gap-4">
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Describe a confusing social situation you experienced…"
            rows={3}
            className="border border-teal-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none bg-teal-50 text-slate-700 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !custom.trim()}
            className="bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition disabled:opacity-40 font-medium"
          >
            {loading ? "Thinking…" : "Explain this situation"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg text-amber-700 text-sm border border-amber-200">
            {error}
          </div>
        )}

        {customResult && (
          <div className="mt-6 p-4 bg-teal-50 rounded-lg text-slate-600 whitespace-pre-wrap text-sm leading-relaxed border border-teal-200">
            {customResult}
          </div>
        )}
      </div>
    </main>
  );
}
