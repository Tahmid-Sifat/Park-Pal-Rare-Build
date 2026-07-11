import { CaseFile } from "@/lib/types/caseTypes";

export function CaseTimeline({ caseFile }: { caseFile: CaseFile }) {
  return (
    <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">Agent timeline</h2>
      <div className="mt-4 space-y-3">
        {caseFile.timeline.map((event) => (
          <div key={event.id} className="border-l-4 border-fern pl-4">
            <h3 className="font-bold">{event.label}</h3>
            <p className="text-sm text-steel">{event.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
