import { CaseFile } from "@/lib/types/caseTypes";

const strengthStyle = {
  strong: "var(--success)",
  possible: "var(--primary)",
  weak: "var(--warning)",
  not_recommended: "var(--danger)"
};

export function AppealGroundsPanel({ caseFile }: { caseFile: CaseFile }) {
  return (
    <section id="appeal" className="premium-card p-6">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Possible appeal grounds</p>
        <h2 className="mt-2 text-2xl font-black text-app">Ranked, cautious, evidence-linked arguments</h2>
        <p className="mt-2 text-sm text-muted">These are suggestions only. Do not rely on a ground unless the evidence supports it.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {caseFile.appealGrounds.map((ground) => (
          <article key={ground.id} className="micro-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl font-black text-app">{ground.title}</h3>
              <span className="rounded-full border border-app px-3 py-1 text-xs font-black" style={{ color: strengthStyle[ground.strength] }}>{ground.strength.replace("_", " ")}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{ground.whyItMayApply}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="soft-panel p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Evidence linked</p>
                <p className="mt-2 text-sm font-semibold text-app">{ground.requiredEvidence.join(", ")}</p>
              </div>
              <div className="soft-panel p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Sources</p>
                <p className="mt-2 text-sm font-semibold text-app">{ground.sourceRefs.join(", ")}</p>
              </div>
            </div>
            {ground.warnings.length ? <p className="mt-4 text-xs font-semibold text-muted">Check before submitting: {ground.warnings.join(" ")}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
