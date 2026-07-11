import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CaseFile } from "@/lib/types/caseTypes";

export function NextActions({ caseFile }: { caseFile: CaseFile }) {
  const actions = caseFile.nextActions?.length
    ? caseFile.nextActions
    : ["Confirm extracted notice details.", "Collect evidence.", "Review the appeal draft.", "Export the appeal pack."];

  return (
    <section className="premium-card p-6">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Action plan</p>
        <h2 className="mt-2 text-2xl font-black text-app">What to do next</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {actions.map((action, index) => (
          <div key={action} className="micro-card flex items-start gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl" style={{ background: "var(--surface-elevated)", color: "var(--primary)" }}>
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Step {index + 1}</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-app">{action}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link className="btn-primary focus-ring" href={`/case/${caseFile.id}/appeal`}>
          Review draft
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link className="btn-secondary focus-ring" href={`/case/${caseFile.id}/pack`}>Export pack</Link>
      </div>
    </section>
  );
}
