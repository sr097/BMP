import { Link } from "wouter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50 p-8">
      <div className="bg-white shadow-sm rounded-xl p-10 max-w-xl w-full text-center border border-sky-100">
        <h1 className="text-3xl font-bold mb-3 text-sky-700">ClearSpeak AI</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Tools to help autistic teens understand figurative language, confusing
          conversations, and unclear social moments.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/literalizer"
            className="bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600 transition block font-medium"
          >
            Fill‑in‑the‑Blank Literal Meaning Tool
          </Link>
          <Link
            href="/situations"
            className="bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition block font-medium"
          >
            Common Situations &amp; Clear Explanations
          </Link>
          <Link
            href="/conversation-helper"
            className="bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition block font-medium"
          >
            Conversation Breakdown Helper
          </Link>
        </div>
      </div>
    </main>
  );
}
