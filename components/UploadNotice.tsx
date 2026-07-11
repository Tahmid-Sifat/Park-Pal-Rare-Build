"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FileText, FileUp, Loader2, ScanLine, Wand2 } from "lucide-react";
import { AppNav } from "./AppNav";
import { DisclaimerBanner } from "./DisclaimerBanner";

const steps = ["Read notice", "Classify type", "Detect deadlines", "Build appeal plan"];

export function UploadNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const [noticeText, setNoticeText] = useState("");
  const [fileText, setFileText] = useState("");
  const [noticeFile, setNoticeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoEvidence, setDemoEvidence] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.get("demo") === "true") void loadDemo();
  }, [params]);

  async function loadDemo() {
    setError("");
    const res = await fetch("/api/demo-notice");
    const text = await res.text();
    setNoticeText(text);
    setDemoEvidence(true);
    setFileText("Demo private parking notice");
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setError("");
    setNoticeFile(file);
    setFileText(file.name);
    if (file.type.startsWith("text/") || file.name.endsWith(".txt")) {
      setNoticeText(await file.text());
    } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setNoticeText((current) => current || `Uploaded PDF: ${file.name}\n\nParkPal will attempt basic embedded-text extraction. If the result is poor, paste the notice text here before analysing.`);
    } else {
      setNoticeText((current) => current || `Uploaded image: ${file.name}\n\nImage OCR is an MVP placeholder. Paste notice text here for reliable extraction.`);
    }
  }

  async function analyze() {
    if (!noticeText.trim() && !noticeFile) {
      setError("Upload a notice or paste the notice text before scanning.");
      return;
    }
    setLoading(true);
    setError("");
    const body = new FormData();
    body.append("noticeText", noticeText);
    body.append("demoEvidence", String(demoEvidence));
    if (noticeFile) body.append("file", noticeFile);
    const res = await fetch("/api/analyze-notice", { method: "POST", body });
    if (!res.ok) {
      setError("ParkPal could not read that notice. Try pasting the text or use the demo notice.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    router.push(`/case/${data.id}`);
  }

  return (
    <main className="page-shell">
      <AppNav />
      <div className="content-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <Link href="/" className="btn-ghost focus-ring w-fit">ParkPal</Link>
          <div className="space-y-4">
            <span className="hero-badge"><ScanLine className="h-4 w-4 text-primary" /> Notice scanner</span>
            <h1 className="text-[clamp(2.2rem,5vw,4.8rem)] font-black leading-[0.98] tracking-tight text-app">Upload your parking notice.</h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              Add a notice file or paste the text. ParkPal reads it, extracts key details, finds deadlines, and prepares the next action plan.
            </p>
          </div>
          <div className="premium-card p-5">
            <p className="text-sm font-black text-app">Scan pipeline</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step} className="micro-card flex items-center gap-3 p-4">
                  <span className={`grid h-9 w-9 place-items-center rounded-full font-black ${loading ? "text-white" : "text-primary"}`} style={{ background: loading ? "linear-gradient(135deg, var(--primary), var(--primary-2))" : "var(--surface-elevated)" }}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : index + 1}
                  </span>
                  <span className="font-bold text-app">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <DisclaimerBanner />
        </section>

        <section className={`premium-card p-5 md:p-7 ${loading ? "scan-line" : ""}`}>
          <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
            <div className="space-y-4">
              <label className="focus-ring group flex min-h-48 cursor-pointer flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-dashed border-app bg-app-surface p-8 text-center hover:shadow-[0_18px_48px_var(--glow)]">
                <span className="grid h-16 w-16 place-items-center rounded-3xl" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-2))", color: "white" }}>
                  <FileUp className="h-7 w-7" />
                </span>
                <span className="text-xl font-black text-app">{fileText || "Drop in a PDF, photo, or text notice"}</span>
                <span className="max-w-md text-sm leading-6 text-muted">PDF and image support stays lightweight for the MVP. Pasted text gives the most reliable extraction.</span>
                <input className="sr-only" type="file" accept=".txt,text/plain,.pdf,image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>

              <textarea
                className="focus-ring min-h-[22rem] w-full rounded-[1.5rem] border border-app bg-app-surface p-5 text-base leading-7 shadow-sm"
                placeholder="Paste notice text here..."
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
              />
            </div>

            <aside className="space-y-4">
              <div className="soft-panel p-5">
                <FileText className="mb-4 h-6 w-6 text-primary" />
                <h2 className="text-xl font-black text-app">Demo-ready path</h2>
                <p className="mt-2 text-sm leading-6 text-muted">Load a private parking charge with evidence, deadlines, appeal grounds, and a draft ready to inspect.</p>
                <button className="btn-secondary focus-ring mt-4 w-full" onClick={loadDemo} type="button">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Use demo notice
                </button>
              </div>
              <div className="soft-panel p-5">
                <h2 className="text-xl font-black text-app">Before scanning</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted">
                  <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-primary" /> Confirm the reference and vehicle details after extraction.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-primary" /> Check deadlines against the official notice.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-primary" /> Add evidence before relying on an appeal ground.</li>
                </ul>
              </div>
              <label className="micro-card flex items-center gap-3 p-4 text-sm font-bold text-app">
                <input type="checkbox" checked={demoEvidence} onChange={(e) => setDemoEvidence(e.target.checked)} />
                Include demo evidence: receipt, signage photo, short stay
              </label>
              {error ? <p className="rounded-2xl border border-app bg-app-surface p-3 text-sm font-bold" style={{ color: "var(--danger)" }}>{error}</p> : null}
              <button className="btn-primary focus-ring w-full" disabled={(!noticeText.trim() && !noticeFile) || loading} onClick={analyze}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
                {loading ? "Scanning notice..." : "Analyse notice"}
                {!loading ? <ArrowRight className="h-5 w-5" /> : null}
              </button>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
