import { Link } from "wouter";

function Logo() {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-sky-100 rounded-2xl p-3 shadow-sm border border-sky-200">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="32" height="22" rx="5" fill="#38bdf8" />
          <rect x="8" y="11" width="14" height="2.5" rx="1.25" fill="white" fillOpacity="0.85" />
          <rect x="8" y="16" width="20" height="2.5" rx="1.25" fill="white" fillOpacity="0.85" />
          <rect x="8" y="21" width="10" height="2.5" rx="1.25" fill="white" fillOpacity="0.85" />
          <path d="M14 28 L10 34 L20 30" fill="#38bdf8" />
        </svg>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sky-50 p-8">
      <div className="bg-white shadow-sm rounded-2xl px-10 py-12 max-w-xl w-full text-center border border-sky-100">
        <Logo />

        <h1 className="text-5xl font-bold mb-3 text-sky-700 tracking-tight">
          ClearSpeak AI
        </h1>
        <p className="text-sky-500 font-medium mb-2 text-base">
          Clear explanations for confusing moments.
        </p>
        <p className="text-slate-400 mb-10 text-sm leading-relaxed">
          Tools to help autistic teens understand figurative language,<br />
          confusing conversations, and unclear social moments.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/literalizer"
            className="bg-sky-400 text-white py-4 rounded-xl hover:bg-sky-500 transition block font-semibold text-base shadow-sm"
          >
            Fill‑in‑the‑Blank Literal Meaning Tool
          </Link>
          <Link
            href="/situations"
            className="bg-teal-500 text-white py-4 rounded-xl hover:bg-teal-600 transition block font-semibold text-base shadow-sm"
          >
            Common Situations &amp; Clear Explanations
          </Link>
          <Link
            href="/conversation-helper"
            className="bg-indigo-500 text-white py-4 rounded-xl hover:bg-indigo-600 transition block font-semibold text-base shadow-sm"
          >
            Conversation Breakdown Helper
          </Link>
        </div>
      </div>
    </main>
  );
}
