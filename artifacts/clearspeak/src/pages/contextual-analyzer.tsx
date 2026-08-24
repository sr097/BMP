import { useState, useRef } from "react";
import { Link } from "wouter";

type Mode = "quick" | "detailed";

const TONE_OPTIONS = [
  "sarcastic",
  "angry",
  "excited",
  "sad",
  "neutral",
  "confused",
  "happy",
];

const RELATIONSHIP_OPTIONS = [
  "friend",
  "family",
  "teacher",
  "coworker",
  "boss",
  "stranger",
  "group",
];

const SETTING_OPTIONS = [
  "school",
  "work",
  "home",
  "public",
  "online",
  "other",
];

const EMOTIONAL_CUES_OPTIONS = [
  "smiling",
  "frowning",
  "avoiding eye contact",
  "looking away",
  "arms crossed",
  "fidgeting",
  "tense shoulders",
  "relaxed posture",
];

export default function ContextualAnalyzer() {
  const [mode, setMode] = useState<Mode>("quick");
  const audioRef = useRef<HTMLInputElement>(null);

  // Quick mode
  const [quickText, setQuickText] = useState("");
  const [quickTone, setQuickTone] = useState("");
  const [quickRelationship, setQuickRelationship] = useState("");
  const [quickSetting, setQuickSetting] = useState("");

  // Detailed mode
  const [detailedText, setDetailedText] = useState("");
  const [detailedTone, setDetailedTone] = useState("");
  const [detailedPace, setDetailedPace] = useState<"slow" | "normal" | "fast">(
    "normal"
  );
  const [detailedVolume, setDetailedVolume] = useState<
    "quiet" | "normal" | "loud"
  >("normal");
  const [detailedRelationship, setDetailedRelationship] = useState("");
  const [detailedSetting, setDetailedSetting] = useState("");
  const [selectedCues, setSelectedCues] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState("");
  const [recentContext, setRecentContext] = useState("");
  const [userObservations, setUserObservations] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quickReady = quickText && quickTone && quickRelationship && quickSetting;

  const detailedReady =
    detailedText && detailedTone && detailedRelationship && detailedSetting;

  function toggleCue(cue: string) {
    setSelectedCues((prev) =>
      prev.includes(cue) ? prev.filter((c) => c !== cue) : [...prev, cue]
    );
  }

  async function callMultimodalApi(payload: Record<string, unknown>) {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/multimodal/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(
          errorData.error || `Request failed (${res.status}). Please try again.`
        );
        return;
      }

      const data = await res.json();
      if (data.analysis) {
        setResult(data.analysis);
      } else {
        setError("No response received. Please try again.");
      }
    } catch (err) {
      setError("Could not connect to server. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quickReady) return;

    const payload = {
      text: quickText,
      voice: {
        transcription: quickText,
        detectedTone: quickTone,
      },
      context: {
        relationship: quickRelationship,
        setting: quickSetting,
      },
    };

    callMultimodalApi(payload);
  }

  function handleDetailedSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!detailedReady) return;

    const payload = {
      text: detailedText,
      voice: {
        transcription: detailedText,
        detectedTone: detailedTone,
        pace: detailedPace,
        volume: detailedVolume,
      },
      context: {
        relationship: detailedRelationship,
        setting: detailedSetting,
        emotionalCues: selectedCues,
        recentEvents: recentContext || undefined,
        conversationHistory: conversationHistory
          ? conversationHistory.split("\n").filter((line) => line.trim())
          : undefined,
      },
      userObservations: userObservations || undefined,
    };

    callMultimodalApi(payload);
  }

  function switchMode(m: Mode) {
    setMode(m);
    setResult("");
    setError("");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50 p-8">
      <div className="bg-white shadow-sm rounded-xl p-10 max-w-2xl w-full border border-blue-100">
        <Link
          href="/"
          className="text-blue-400 hover:text-blue-600 text-sm mb-4 block transition"
        >
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-blue-700">
          🎭 Context Analyzer
        </h1>
        <p className="text-slate-600 mb-4 text-sm leading-relaxed">
          Understand confusing social moments by combining what was said,
          <strong> how it was said</strong>, and the <strong>context</strong>.
        </p>

        <div className="flex rounded-lg overflow-hidden border border-blue-200 mb-6">
          <button
            onClick={() => switchMode("quick")}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              mode === "quick"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            ⚡ Quick Analysis
          </button>
          <button
            onClick={() => switchMode("detailed")}
            className={`flex-1 py-2.5 text-sm font-medium transition border-l border-blue-200 ${
              mode === "detailed"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            🔬 Deep Dive
          </button>
        </div>

        {mode === "quick" ? (
          <>
            <p className="text-xs text-slate-500 mb-4 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 leading-relaxed">
              ⚡ Fast mode: Just tell us what was said, the tone, who said it,
              and where.
            </p>

            <form onSubmit={handleQuickSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  What did they say?
                </label>
                <textarea
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  placeholder="e.g., That's fine, whatever."
                  rows={3}
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  What tone did they use?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setQuickTone(tone)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition border-2 ${
                        quickTone === tone
                          ? "bg-blue-500 text-white border-blue-600"
                          : "bg-white text-slate-700 border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Who said it?
                </label>
                <select
                  value={quickRelationship}
                  onChange={(e) => setQuickRelationship(e.target.value)}
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                >
                  <option value="">Select…</option>
                  {RELATIONSHIP_OPTIONS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Where did it happen?
                </label>
                <select
                  value={quickSetting}
                  onChange={(e) => setQuickSetting(e.target.value)}
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                >
                  <option value="">Select…</option>
                  {SETTING_OPTIONS.map((setting) => (
                    <option key={setting} value={setting}>
                      {setting}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center mt-3">
                <button
                  type="submit"
                  disabled={loading || !quickReady}
                  className="bg-blue-600 text-white px-10 py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-40 font-semibold text-base shadow-sm"
                >
                  {loading ? "Analyzing…" : "Analyze This Moment"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-4 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 leading-relaxed">
              🔬 Deep dive: Add details about tone, voice, body language,
              context, and what confused you.
            </p>

            <form onSubmit={handleDetailedSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  What did they say?
                </label>
                <textarea
                  value={detailedText}
                  onChange={(e) => setDetailedText(e.target.value)}
                  placeholder="e.g., That's fine, whatever."
                  rows={3}
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                    Tone
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {TONE_OPTIONS.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setDetailedTone(tone)}
                        className={`px-2 py-1 rounded text-xs font-medium transition border ${
                          detailedTone === tone
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-white text-slate-700 border-blue-200 hover:bg-blue-50"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                    Pace
                  </label>
                  <div className="flex gap-2">
                    {(["slow", "normal", "fast"] as const).map((pace) => (
                      <button
                        key={pace}
                        type="button"
                        onClick={() => setDetailedPace(pace)}
                        className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition border ${
                          detailedPace === pace
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-white text-slate-700 border-blue-200 hover:bg-blue-50"
                        }`}
                      >
                        {pace}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                    Volume
                  </label>
                  <div className="flex gap-2">
                    {(["quiet", "normal", "loud"] as const).map((vol) => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setDetailedVolume(vol)}
                        className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition border ${
                          detailedVolume === vol
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-white text-slate-700 border-blue-200 hover:bg-blue-50"
                        }`}
                      >
                        {vol}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                    Who said it?
                  </label>
                  <select
                    value={detailedRelationship}
                    onChange={(e) => setDetailedRelationship(e.target.value)}
                    className="w-full border-2 border-blue-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select…</option>
                    {RELATIONSHIP_OPTIONS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Where?
                </label>
                <select
                  value={detailedSetting}
                  onChange={(e) => setDetailedSetting(e.target.value)}
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Select…</option>
                  {SETTING_OPTIONS.map((setting) => (
                    <option key={setting} value={setting}>
                      {setting}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Body language & expressions (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EMOTIONAL_CUES_OPTIONS.map((cue) => (
                    <button
                      key={cue}
                      type="button"
                      onClick={() => toggleCue(cue)}
                      className={`px-3 py-2 rounded text-xs font-medium transition border-2 ${
                        selectedCues.includes(cue)
                          ? "bg-blue-500 text-white border-blue-600"
                          : "bg-white text-slate-700 border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      {cue}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Recent context{" "}
                  <span className="text-slate-400 font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={recentContext}
                  onChange={(e) => setRecentContext(e.target.value)}
                  placeholder="e.g., we had argued about something earlier"
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Earlier conversation{" "}
                  <span className="text-slate-400 font-normal normal-case">
                    (optional, one line per message)
                  </span>
                </label>
                <textarea
                  value={conversationHistory}
                  onChange={(e) => setConversationHistory(e.target.value)}
                  placeholder="Me: Are you mad at me?&#10;Them: No, I'm fine"
                  rows={3}
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  What confused you?{" "}
                  <span className="text-slate-400 font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={userObservations}
                  onChange={(e) => setUserObservations(e.target.value)}
                  placeholder="e.g., They said they were fine but seemed upset. Their tone didn't match their words."
                  rows={2}
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div className="flex justify-center mt-3">
                <button
                  type="submit"
                  disabled={loading || !detailedReady}
                  className="bg-blue-600 text-white px-10 py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-40 font-semibold text-base shadow-sm"
                >
                  {loading ? "Analyzing…" : "Deep Dive Analysis"}
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-slate-700 text-sm leading-relaxed border border-blue-200 whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
