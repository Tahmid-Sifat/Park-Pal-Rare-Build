"use client";

import { useState } from "react";
import { Copy, FileText, Loader2, RefreshCcw } from "lucide-react";
import { CaseFile } from "@/lib/types/caseTypes";

type Tab = "full" | "short" | "evidence";
const tones = ["Calm and factual", "Firm", "Very concise", "Tribunal-ready"];

export function AppealDraftEditor({ caseFile }: { caseFile: CaseFile }) {
  const [tone, setTone] = useState("Calm and factual");
  const [tab, setTab] = useState<Tab>("full");
  const [shortDraft, setShortDraft] = useState(caseFile.draftShort);
  const [fullDraft, setFullDraft] = useState(caseFile.draftFull);
  const [loading, setLoading] = useState(false);

  async function regenerate() {
    setLoading(true);
    const res = await fetch("/api/generate-appeal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: caseFile.id, tone, selectedGroundIds: caseFile.appealGrounds.map((g) => g.id) })
    });
    const updated = (await res.json()) as CaseFile;
    setShortDraft(updated.draftShort);
    setFullDraft(updated.draftFull);
    setLoading(false);
  }

  const evidenceList = caseFile.evidenceItems.map((item) => `${item.name}: ${item.status}`).join("\n");
  const copyText = tab === "short" ? shortDraft : tab === "evidence" ? evidenceList : fullDraft;

  return (
    <section className="premium-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Appeal draft</p>
          <h2 className="mt-2 text-2xl font-black text-app">Draft ready to copy into the portal</h2>
          <p className="mt-2 text-sm text-muted">Editable before export. No automatic submission.</p>
        </div>
        <button className="btn-primary focus-ring" onClick={regenerate} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          {loading ? "Generating" : "Regenerate"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tones.map((item) => (
          <button key={item} type="button" onClick={() => setTone(item)} className={`focus-ring rounded-full border border-app px-4 py-2 text-sm font-black ${tone === item ? "btn-primary" : "bg-app-surface text-app"}`}>
            {item.replace("Calm and factual", "Calm")}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["full", "Full appeal"],
          ["short", "Portal short version"],
          ["evidence", "Evidence list"]
        ].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id as Tab)} className={`focus-ring rounded-2xl px-4 py-2 text-sm font-black ${tab === id ? "btn-secondary" : "btn-ghost"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="micro-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-muted"><FileText className="h-4 w-4 text-primary" /> Uses confirmed facts only where available</div>
        {tab === "full" ? (
          <textarea className="focus-ring min-h-96 w-full rounded-[1.25rem] border border-app bg-app-surface p-4 leading-7" value={fullDraft} onChange={(e) => setFullDraft(e.target.value)} />
        ) : tab === "short" ? (
          <textarea className="focus-ring min-h-48 w-full rounded-[1.25rem] border border-app bg-app-surface p-4 leading-7" value={shortDraft} onChange={(e) => setShortDraft(e.target.value)} />
        ) : (
          <pre className="min-h-48 whitespace-pre-wrap rounded-[1.25rem] border border-app bg-app-surface p-4 text-sm leading-7 text-app">{evidenceList || "No evidence listed yet."}</pre>
        )}
      </div>
      <button className="btn-secondary focus-ring mt-4" onClick={() => navigator.clipboard.writeText(copyText)}>
        <Copy className="h-4 w-4" />
        Copy current tab
      </button>
    </section>
  );
}
