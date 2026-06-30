import { Link } from "wouter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-100 p-8">
      <div className="bg-stone-50 shadow-md rounded-xl p-10 max-w-xl w-full text-center border border-stone-200">
        <h1 className="text-3xl font-bold mb-3 text-slate-600">ClearSpeak AI</h1>
        <p className="text-stone-500 mb-8 leading-relaxed">
          Tools to help autistic teens understand figurative language, confusing
          conversations, and unclear social moments.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/literalizer"
            className="bg-slate-500 text-stone-100 py-3 rounded-lg hover:bg-slate-600 transition block font-medium"
          >
            Fill‑in‑the‑Blank Literal Meaning Tool
          </Link>
          <Link
            href="/situations"
            className="bg-indigo-700 text-stone-100 py-3 rounded-lg hover:bg-indigo-800 transition block font-medium"
          >
            Common Situations &amp; Clear Explanations
          </Link>
          <Link
            href="/conversation-helper"
            className="bg-teal-700 text-stone-100 py-3 rounded-lg hover:bg-teal-800 transition block font-medium"
          >
            Conversation Breakdown Helper
          </Link>
        </div>
      </div>
    </main>
  );
}
