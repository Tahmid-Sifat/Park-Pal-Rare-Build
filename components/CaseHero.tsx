import Link from "next/link";
import { CalendarPlus, ShieldCheck } from "lucide-react";
import { CaseFile } from "@/lib/types/caseTypes";
import { displayDate } from "@/lib/utils/dateUtils";
import { getGoogleCalendarUrl } from "@/lib/calendar/googleCalendar";

export function CaseHero({ caseFile }: { caseFile: CaseFile }) {
  const fields = caseFile.noticeFields;
  const appealDeadline = caseFile.deadlines.find((deadline) => deadline.id === "appeal") || caseFile.deadlines[0];
  const amount = fields.amountDue ? `GBP ${fields.amountDue}` : "Needs confirmation";
  const calendarUrl = appealDeadline
    ? getGoogleCalendarUrl({
        title: `ParkPal: ${appealDeadline.title}`,
        date: appealDeadline.date,
        details: appealDeadline.sourceText
      })
    : undefined;

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
          <p className="max-w-2xl rounded-3xl border border-app bg-app-surface p-4 text-sm font-semibold leading-6 text-app">Your next steps are ordered below. Keep the original notice nearby while you verify dates and evidence.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric label="Appeal deadline" value={appealDeadline ? displayDate(appealDeadline.date) : "Needs confirmation"} action={calendarUrl} />
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
        <a href={action} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary">
          <CalendarPlus className="h-4 w-4" /> Add to Calendar
        </a>
      ) : null}
    </article>
  );
}
