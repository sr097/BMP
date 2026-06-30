import { useState } from "react";
import { Link } from "wouter";

const COMMON_SITUATIONS = [
  {
    category: "Job Interviews",
    title: "Interviewer says \"Tell me about yourself\"",
    explanation: "They don't want your entire life story. They want a short summary (1–2 minutes) of: what you're good at, what kind of work or school experience you have, and why you're interested in this job. Stick to things related to the job. Practice a short answer ahead of time so it feels natural.",
  },
  {
    category: "Job Interviews",
    title: "Interviewer asks \"What's your biggest weakness?\"",
    explanation: "They're not trying to trick you. They want to see that you understand yourself and are willing to grow. Pick something real but not critical to the job, and explain what you're doing to improve it. Example: \"I sometimes take longer to start tasks because I want to do them perfectly, but I've been using timers to help me get started.\"",
  },
  {
    category: "Job Interviews",
    title: "They say \"We'll be in touch\" at the end of the interview",
    explanation: "This doesn't mean yes or no — it just means they'll contact you later. It's polite to send a short thank-you email within 24 hours. If you haven't heard back after a week, it's okay to send one follow-up email asking about the status.",
  },
  {
    category: "Task Transitions",
    title: "A supervisor says \"When you get a chance, can you…\"",
    explanation: "Even though this sounds optional, it usually means they want it done soon — just not urgently. A good rule: treat it as something to do within the same day or by end of the next day. If you're not sure, it's fine to ask: \"Should I do that before [current task] or after?\"",
  },
  {
    category: "Task Transitions",
    title: "Your schedule changes suddenly and you feel stuck",
    explanation: "It's normal to feel overwhelmed when plans change unexpectedly. Try this: pause, take a breath, and ask \"What's the most important thing right now?\" If you're not sure, ask someone you trust. You don't have to figure it out alone — asking for clarity is always okay.",
  },
  {
    category: "Task Transitions",
    title: "You finish a task but don't know what to do next",
    explanation: "This is a common moment of uncertainty. Check your task list or ask your supervisor: \"I just finished [task]. What would you like me to work on next?\" Having a ready-made question like this makes transitions much smoother.",
  },
  {
    category: "Workplace & School",
    title: "A coworker or classmate says \"Good job\" but it felt sarcastic",
    explanation: "It can be hard to tell. Look for clues: did they smile? Was their voice flat or exaggerated? If you're genuinely unsure, assume it was sincere. If a pattern of unkind comments continues, it's okay to talk to a trusted adult or supervisor.",
  },
  {
    category: "Workplace & School",
    title: "Someone gives feedback on your work and it feels like an attack",
    explanation: "Feedback about work is usually not about you as a person — it's about the task. Try to separate the two. If feedback is hard to hear, it's okay to say \"Thank you, I'll think about that\" and process it later. You don't have to respond right away.",
  },
  {
    category: "Workplace & School",
    title: "Everyone else seems to know what's happening but you don't",
    explanation: "This happens to a lot of people and doesn't mean you missed something obvious. It's completely okay to ask: \"Can you catch me up on what we're doing?\" or \"I want to make sure I understand — could you explain that again?\" Asking questions is a sign of responsibility, not weakness.",
  },
  {
    category: "Social Situations",
    title: "Someone says \"We should hang out sometime\"",
    explanation: "This usually means the person likes you and is being friendly, but they may not have a specific plan. It's often a polite way of saying they enjoy your company. You don't need to immediately set a date — you can say \"That sounds fun!\" and see if they follow up.",
  },
  {
    category: "Social Situations",
    title: "A friend says \"It's fine\" but seems upset",
    explanation: "When someone says \"it's fine\" but their tone or body language says otherwise, they may actually be upset but not ready to talk about it. Give them some space and check in later with something like \"Hey, I just want to make sure you're okay.\"",
  },
  {
    category: "Social Situations",
    title: "Someone says \"I'll think about it\"",
    explanation: "This could mean yes or no. Sometimes it means they genuinely need time to decide. Other times it's a polite way to say no without conflict. If it's important, it's okay to follow up once after a day or two.",
  },
];

const CATEGORY_COLORS: Record<string, { border: string; bg: string; header: string; chevron: string; hover: string }> = {
  "Job Interviews":     { border: "border-sky-200",     bg: "bg-sky-50",     header: "text-sky-600",     chevron: "text-sky-400",     hover: "hover:bg-sky-50"     },
  "Task Transitions":   { border: "border-teal-200",    bg: "bg-teal-50",    header: "text-teal-600",    chevron: "text-teal-400",    hover: "hover:bg-teal-50"    },
  "Workplace & School": { border: "border-emerald-200", bg: "bg-emerald-50", header: "text-emerald-600", chevron: "text-emerald-400", hover: "hover:bg-emerald-50" },
  "Social Situations":  { border: "border-cyan-200",    bg: "bg-cyan-50",    header: "text-cyan-600",    chevron: "text-cyan-400",    hover: "hover:bg-cyan-50"    },
};

export default function Situations() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [customResult, setCustomResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = Array.from(new Set(COMMON_SITUATIONS.map((s) => s.category)));

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
    <main className="flex min-h-screen flex-col items-center bg-teal-50 p-8">
      <div className="bg-white shadow-sm rounded-xl p-10 max-w-xl w-full border border-teal-100">
        <Link href="/" className="text-teal-400 hover:text-teal-600 text-sm mb-4 block transition">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold mb-2 text-teal-700">Common Situations &amp; Clear Explanations</h1>
        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
          Tap a situation to see a clear explanation, or describe your own.
        </p>

        <div className="flex flex-col gap-6 mb-8">
          {categories.map((cat) => {
            const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Social Situations"];
            const items = COMMON_SITUATIONS.map((s, i) => ({ ...s, i })).filter((s) => s.category === cat);
            return (
              <div key={cat}>
                <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${colors.header}`}>{cat}</h2>
                <div className="flex flex-col gap-2">
                  {items.map(({ title, explanation, i }) => (
                    <div key={i} className={`border ${colors.border} rounded-lg overflow-hidden`}>
                      <button
                        className={`w-full text-left px-4 py-3 font-medium text-stone-700 ${colors.hover} transition flex justify-between items-center`}
                        onClick={() => setExpanded(expanded === i ? null : i)}
                      >
                        <span className="pr-2">{title}</span>
                        <span className={`${colors.chevron} ml-2 shrink-0`}>{expanded === i ? "▲" : "▼"}</span>
                      </button>
                      {expanded === i && (
                        <div className={`px-4 py-3 ${colors.bg} text-stone-600 text-sm leading-relaxed border-t ${colors.border}`}>
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

        <h2 className="text-lg font-semibold text-teal-700 mb-3">Describe your own situation</h2>
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
          <div className="mt-6 p-4 bg-amber-50 rounded-lg text-amber-700 text-sm border border-amber-200">{error}</div>
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
