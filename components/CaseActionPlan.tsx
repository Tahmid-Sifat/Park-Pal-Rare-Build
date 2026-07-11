import Link from "next/link";
import { CalendarCheck2, ExternalLink, FilePenLine, FolderUp, ShieldCheck } from "lucide-react";
import { CaseFile } from "@/lib/types/caseTypes";

const steps = [
  {
    id: "deadline",
    title: "Verify the deadline",
    detail: "Match the appeal and discount dates to the official notice before you do anything else.",
    href: "#deadlines",
    icon: CalendarCheck2,
    primary: true
  },
  {
    id: "evidence",
    title: "Add missing evidence",
    detail: "Upload the photos, receipts or records that support your strongest factual point.",
    icon: FolderUp,
    primary: false
  },
  {
    id: "draft",
    title: "Review your draft",
    detail: "Check the facts, remove anything unsupported, and make the request in your own words.",
    icon: FilePenLine,
    primary: false
  },
  {
    id: "pack",
    title: "Export, then submit safely",
    detail: "Download your appeal pack and use only the official route shown on the notice.",
    icon: ShieldCheck,
    primary: false
  }
] as const;

export function CaseActionPlan({ caseFile }: { caseFile: CaseFile }) {
  const officialRoute = caseFile.noticeFields.appealUrl;

  return (
    <section aria-labelledby="action-plan-title" className="premium-card overflow-hidden p-6 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Your action plan</p>
          <h2 id="action-plan-title" className="mt-2 text-2xl font-black tracking-tight text-app sm:text-3xl">Four clear steps. One safe route.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Start with the deadline, build the evidence, then review and export before submitting through the official notice route.</p>
        </div>
        <span className="status-pill normal-case tracking-normal">Start with step 1</span>
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const href = step.id === "evidence"
            ? `/case/${caseFile.id}/evidence`
            : step.id === "draft"
              ? `/case/${caseFile.id}/appeal`
              : step.id === "pack"
                ? `/case/${caseFile.id}/pack`
                : step.href ?? "#deadlines";

          return (
            <li key={step.id} className="min-w-0">
              <Link
                href={href}
                className={`focus-ring block h-full rounded-3xl border p-4 sm:p-5 ${step.primary ? "bg-[var(--surface-elevated)] shadow-[0_18px_46px_var(--glow)]" : "bg-app-surface"}`}
                style={{ borderColor: step.primary ? "var(--primary)" : "var(--border)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl font-black text-white" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-2))" }}>{index + 1}</span>
                  <Icon className="h-5 w-5 shrink-0 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-black text-app">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.detail}</p>
                <p className="mt-4 text-sm font-black text-primary">{step.primary ? "Start here" : "Open step"} →</p>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-app bg-app-surface p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-app">ParkPal never submits an appeal for you. Confirm every detail, then use the official route on the notice.</p>
        {officialRoute ? (
          <a className="btn-primary focus-ring w-full px-4 py-2 text-sm sm:w-auto sm:whitespace-nowrap" href={officialRoute} target="_blank" rel="noreferrer">
            Open official route <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-sm font-black text-muted">Official route needs confirmation</span>
        )}
      </div>
    </section>
  );
}
