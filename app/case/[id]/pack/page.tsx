import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { getCase } from "@/lib/storage/caseStore";
import { displayDate } from "@/lib/utils/dateUtils";

export default async function PackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseFile = await getCase(id);
  if (!caseFile) notFound();
  const fields = caseFile.noticeFields;
  return (
    <main className="min-h-screen px-5 py-8 text-app">
      <div className="no-print mx-auto mb-5 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <Link href={`/case/${caseFile.id}`} className="btn-ghost focus-ring px-0">Back to dashboard</Link>
        <div className="flex flex-wrap gap-2">
          <PrintButton />
          <a className="btn-secondary focus-ring" href={`/api/generate-pack?caseId=${caseFile.id}`}>Download HTML</a>
          <a className="btn-primary focus-ring" href={`/api/generate-pack?caseId=${caseFile.id}&format=pdf`}>Download PDF</a>
        </div>
      </div>
      <article className="premium-card mx-auto max-w-5xl space-y-8 p-8 print:shadow-none">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Printable support bundle</p>
          <h1 className="mt-2 text-4xl font-black text-app">ParkPal appeal pack</h1>
          <p className="mt-2 text-sm text-muted">Informational support only. Verify all details against the official notice.</p>
        </header>
        <section>
          <h2 className="text-2xl font-black text-app">Case summary</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {[
              ["Issuer", fields.issuerName],
              ["Reference", fields.noticeReference],
              ["Vehicle", fields.vehicleRegistration],
              ["Location", fields.location],
              ["Amount", fields.amountDue ? `GBP ${fields.amountDue}` : "Needs confirmation"],
              ["Notice type", caseFile.noticeType]
            ].map(([label, value]) => (
              <div key={label} className="micro-card p-4">
                <strong className="text-xs uppercase tracking-[0.16em] text-muted">{label}</strong>
                <p className="mt-1 font-semibold text-app">{value}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-black text-app">Timeline</h2>
          <ul className="mt-3 space-y-2">
            {caseFile.deadlines.map((deadline) => (
              <li key={deadline.id} className="micro-card p-3">{deadline.title}: {displayDate(deadline.date)}. {deadline.sourceText}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-black text-app">Appeal grounds</h2>
          <ul className="mt-3 space-y-2">
            {caseFile.appealGrounds.map((ground) => (
              <li key={ground.id} className="micro-card p-3"><strong>{ground.title}</strong>: {ground.whyItMayApply} Strength: {ground.strength}.</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-black text-app">Evidence checklist</h2>
          <ul className="mt-3 space-y-2">
            {caseFile.evidenceItems.map((item) => (
              <li key={item.id} className="micro-card p-3">{item.name}: {item.status}. {item.whyNeeded}</li>
            ))}
          </ul>
          {caseFile.evidenceAttachments?.length ? (
            <div className="mt-4">
              <h3 className="font-black text-app">Stored evidence files</h3>
              <ul className="mt-2 space-y-2">
                {caseFile.evidenceAttachments.map((file) => (
                  <li key={file.id} className="micro-card p-3">{file.fileName} ({Math.ceil(file.size / 1024)} KB)</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
        <section>
          <h2 className="text-2xl font-black text-app">Appeal draft</h2>
          <pre className="mt-3 whitespace-pre-wrap rounded-[1.5rem] border border-app bg-app-surface p-5 font-sans leading-7 text-app">{caseFile.draftFull}</pre>
        </section>
      </article>
    </main>
  );
}
