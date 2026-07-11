import { CaseFile } from "@/lib/types/caseTypes";

const statusStyles = {
  uploaded: "var(--success)",
  missing: "var(--warning)",
  optional: "var(--muted)"
};

export function EvidenceChecklist({ caseFile }: { caseFile: CaseFile }) {
  const uploaded = caseFile.evidenceItems.filter((item) => item.status === "uploaded").length;
  const required = caseFile.evidenceItems.filter((item) => item.status !== "optional").length || 1;
  const strength = Math.round((uploaded / required) * 100);
  const label = strength >= 80 ? "Appeal-ready" : strength >= 50 ? "Medium" : "Needs evidence";

  return (
    <section id="evidence" className="premium-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Evidence checklist</p>
          <h2 className="mt-2 text-2xl font-black text-app">Make the appeal stronger before submitting</h2>
        </div>
        <div className="w-full max-w-xs rounded-3xl border border-app bg-app-surface p-4">
          <div className="flex items-center justify-between text-sm font-black text-app"><span>Evidence strength</span><span>{label}</span></div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, strength)}%`, background: "linear-gradient(90deg, var(--warning), var(--success))" }} />
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {caseFile.evidenceItems.map((item) => (
          <article key={item.id} className="micro-card p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-black text-app">{item.name}</h3>
              <span className="rounded-full border border-app px-3 py-1 text-xs font-black" style={{ color: statusStyles[item.status] }}>{item.status}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{item.whyNeeded}</p>
            {item.example ? <p className="mt-3 rounded-2xl bg-app-surface p-3 text-xs text-muted">Example: {item.example}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
