"use client";

import { useState } from "react";
import { FileUp, Loader2, Save, Wand2 } from "lucide-react";
import { CaseFile } from "@/lib/types/caseTypes";
import { EvidenceChecklist } from "./EvidenceChecklist";

export function EvidenceWorkspace({ initialCase }: { initialCase: CaseFile }) {
  const [caseFile, setCaseFile] = useState(initialCase);
  const [evidenceText, setEvidenceText] = useState(initialCase.evidenceSummary || "");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  async function saveEvidence(useDemoEvidence = false) {
    setSaving(true);
    const body = new FormData();
    body.append("caseId", caseFile.id);
    body.append("evidenceText", evidenceText);
    body.append("useDemoEvidence", String(useDemoEvidence));
    files.forEach((file) => body.append("files", file));
    const res = await fetch("/api/update-evidence", { method: "POST", body });
    const updated = (await res.json()) as CaseFile;
    setCaseFile(updated);
    setEvidenceText(updated.evidenceSummary || evidenceText);
    setFiles([]);
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <section className="premium-card p-6">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Evidence workspace</p>
          <h2 className="mt-2 text-2xl font-black text-app">Upload or describe supporting evidence</h2>
          <p className="mt-2 text-sm text-muted">Files are stored for this demo case memory. Attach the real evidence again on the official appeal portal.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="focus-ring flex min-h-28 cursor-pointer items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-app bg-app-surface p-5 text-center font-black text-app hover:shadow-[0_18px_48px_var(--glow)]">
            <FileUp className="h-6 w-6 text-primary" />
            {files.length ? `${files.length} file(s) selected` : "Select evidence files"}
            <input className="sr-only" type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} />
          </label>
          <button className="btn-secondary focus-ring" onClick={() => saveEvidence(true)} type="button">
            <Wand2 className="h-5 w-5 text-primary" />
            Use demo evidence
          </button>
        </div>
        <textarea
          className="focus-ring mt-4 min-h-44 w-full rounded-[1.5rem] border border-app bg-app-surface p-4"
          placeholder="Describe evidence: signage photo, pharmacy receipt, payment screenshot, Blue Badge, permit, machine fault, witness note..."
          value={evidenceText}
          onChange={(event) => setEvidenceText(event.target.value)}
        />
        <button className="btn-primary focus-ring mt-4" disabled={saving} onClick={() => saveEvidence(false)}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving evidence..." : "Save evidence to case"}
        </button>
      </section>
      {caseFile.evidenceAttachments?.length ? (
        <section className="premium-card p-6">
          <h2 className="text-2xl font-black text-app">Stored evidence files</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-2">
            {caseFile.evidenceAttachments.map((file) => (
              <li key={file.id} className="micro-card px-4 py-3 font-semibold">
                {file.fileName} - {Math.ceil(file.size / 1024)} KB
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <EvidenceChecklist caseFile={caseFile} />
    </div>
  );
}
