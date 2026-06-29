import { Link } from "wouter";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-600">ClearSpeak AI</h1>
        <p className="text-gray-700 mb-8">
          Tools to help autistic teens understand figurative language, confusing
          conversations, and unclear social moments.
        </p>
        <div className="flex flex-col gap-4">
          <Link
            href="/literalizer"
            className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition block"
          >
            Fill‑in‑the‑Blank Literal Meaning Tool
          </Link>
          <Link
            href="/situations"
            className="bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition block"
          >
            Common Situations &amp; Clear Explanations
          </Link>
          <Link
            href="/conversation-helper"
            className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition block"
          >
            Conversation Breakdown Helper
          </Link>
        </div>
      </div>
    </main>
  );
}
