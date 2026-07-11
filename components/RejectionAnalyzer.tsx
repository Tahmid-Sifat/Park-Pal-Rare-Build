"use client";

import { useState } from "react";
import { FileSearch, Loader2, Wand2 } from "lucide-react";
import { RejectionAnalysis } from "@/lib/types/caseTypes";

export function RejectionAnalyzer({ caseId }: { caseId: string }) {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<RejectionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadDemo() {
    const res = await fetch("/api/demo-rejection");
    setText(await res.text());
  }

  async function analyze() {
    setLoading(true);
    const res = await fetch("/api/analyze-rejection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, rejectionText: text })
    });
    setAnalysis(await res.json());
    setLoading(false);
  }

  return (
    <section className="premium-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Escalation mode</p>
          <h2 className="mt-2 text-2xl font-black text-app">Upload or paste a rejection letter</h2>
          <p className="mt-2 text-sm text-muted">ParkPal checks for POPLA, IAS, tribunal, court wording, deadline clues, and next route.</p>
        </div>
        <button className="btn-secondary focus-ring" onClick={loadDemo} type="button"><Wand2 className="h-4 w-4 text-primary" /> Load POPLA escalation demo</button>
      </div>
      <textarea className="focus-ring min-h-48 w-full rounded-[1.5rem] border border-app bg-app-surface p-4 leading-7 sm:min-h-64" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn-primary focus-ring mt-4 w-full sm:w-auto" disabled={!text.trim() || loading} onClick={analyze}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSearch className="h-5 w-5" />}
        {loading ? "Analysing..." : "Analyse rejection"}
      </button>
      {analysis ? (
        <div className="mt-6 grid gap-3">
          {Object.entries({
            "Rejection reason": analysis.rejectionReason,
            "New deadline": analysis.newDeadline || "Needs confirmation",
            "Escalation route": analysis.escalationRoute,
            "Evidence addressed": analysis.evidenceAddressed,
            "Next action": analysis.nextRecommendedAction
          }).map(([label, value]) => (
            <div key={label} className="micro-card p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</p>
              <p className="mt-2 font-semibold leading-6 text-app">{value}</p>
            </div>
          ))}
          {analysis.retrievedSources?.length ? (
            <div className="micro-card p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                Knowledge retrieved ({analysis.ragModeUsed || "rag"})
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-app">
                {analysis.retrievedSources.map((source) => (
                  <li key={`${source.document}-${source.score}`}>
                    <span className="font-semibold">{source.document}</span>
                    <span className="text-muted"> · score {source.score}</span>
                    <p className="mt-1 text-muted">{source.snippet.slice(0, 180)}{source.snippet.length > 180 ? "…" : ""}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <textarea className="focus-ring min-h-40 rounded-[1.5rem] border border-app bg-app-surface p-4 leading-7" value={analysis.escalationDraft} onChange={(e) => setAnalysis({ ...analysis, escalationDraft: e.target.value })} />
        </div>
      ) : null}
    </section>
  );
}
