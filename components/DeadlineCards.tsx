import { CalendarPlus, Clock3 } from "lucide-react";
import { CaseFile } from "@/lib/types/caseTypes";
import { displayDate } from "@/lib/utils/dateUtils";
import { getGoogleCalendarUrl } from "@/lib/calendar/googleCalendar";
import { ConfidenceBar } from "./ConfidenceBar";

const reminderLabels = ["1 day before", "10 minutes before", "5 minutes before"];

export function DeadlineCards({ caseFile }: { caseFile: CaseFile }) {
  return (
    <section id="deadlines" className="premium-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Deadline awareness</p>
          <h2 className="mt-2 text-2xl font-black text-app">Calendar-ready timeline</h2>
          <p className="mt-2 text-sm text-muted">Verify every date against the official notice before acting.</p>
        </div>
        <span className="status-pill normal-case tracking-normal"><Clock3 className="h-4 w-4 text-primary" /> {caseFile.deadlines.length} deadlines tracked</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {caseFile.deadlines.map((deadline) => (
          <article key={deadline.id} className="micro-card p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{deadline.type}</p>
            <h3 className="mt-2 text-lg font-black text-app">{deadline.title}</h3>
            <p className="mb-3 mt-2 text-2xl font-black text-primary sm:text-3xl">{displayDate(deadline.date)}</p>
            <ConfidenceBar value={deadline.confidence} />
            <div className="mt-4 flex flex-wrap gap-2">
              {reminderLabels.map((reminder) => <span key={reminder} className="rounded-full border border-app px-2 py-1 text-[11px] font-bold text-muted">{reminder}</span>)}
            </div>
            <p className="mt-4 min-h-12 text-xs leading-5 text-muted">{deadline.sourceText}</p>
            <a
              className="btn-primary focus-ring mt-4 w-full px-3 py-2 text-sm"
              href={getGoogleCalendarUrl({
                title: `ParkPal: ${deadline.title}`,
                date: deadline.date,
                details: deadline.sourceText
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarPlus className="h-4 w-4" />
              Add to Calendar
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
