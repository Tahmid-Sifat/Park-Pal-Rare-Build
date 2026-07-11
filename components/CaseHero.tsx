import Link from "next/link";
import { CalendarPlus, FileText, ShieldCheck } from "lucide-react";
import { CaseFile } from "@/lib/types/caseTypes";
import { displayDate } from "@/lib/utils/dateUtils";

export function CaseHero({ caseFile }: { caseFile: CaseFile }) {
  const fields = caseFile.noticeFields;
  const appealDeadline = caseFile.deadlines.find((deadline) => deadline.id === "appeal") || caseFile.deadlines[0];
  const amount = fields.amountDue ? `GBP ${fields.amountDue}` : "Needs confirmation";
  return (
    <section className="premium-card overflow-hidden p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <span className="hero-badge normal-case tracking-normal">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {caseFile.noticeType.replaceAll("_", " ")}
          </span>
          <div>
            <h1 className="text-[clamp(2rem,5vw,4.6rem)] font-black leading-none tracking-tight text-app">Case dashboard</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{caseFile.likelyRoute}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-primary focus-ring" href={`/case/${caseFile.id}/appeal`}>
              <FileText className="h-5 w-5" />
              Review appeal draft
            </Link>
            <Link className="btn-secondary focus-ring" href={`/case/${caseFile.id}/pack`}>Export pack</Link>
            <Link className="btn-secondary focus-ring" href={`/case/${caseFile.id}/rejection`}>Rejection analyzer</Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric label="Appeal deadline" value={appealDeadline ? displayDate(appealDeadline.date) : "Needs confirmation"} action={appealDeadline ? `/api/generate-calendar?caseId=${caseFile.id}&deadlineId=${appealDeadline.id}` : undefined} />
          <HeroMetric label="Amount" value={amount} />
          <HeroMetric label="Issuer" value={fields.issuerName || "Not detected yet"} />
          <HeroMetric label="Reference" value={fields.noticeReference || "Needs confirmation"} mono />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value, action, mono }: { label: string; value: string; action?: string; mono?: boolean }) {
  return (
    <article className="soft-panel p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className={`mt-2 break-words text-2xl font-black text-app ${mono ? "font-mono text-xl" : ""}`}>{value}</p>
      {action ? (
        <Link href={action} className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary">
          <CalendarPlus className="h-4 w-4" /> Add to Calendar
        </Link>
      ) : null}
    </article>
  );
}
