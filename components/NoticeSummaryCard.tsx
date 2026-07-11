import { CaseFile } from "@/lib/types/caseTypes";
import { displayDate } from "@/lib/utils/dateUtils";
import { ConfidenceBar } from "./ConfidenceBar";

export function NoticeSummaryCard({ caseFile }: { caseFile: CaseFile }) {
  const fields = caseFile.noticeFields;
  const rows = [
    ["Notice type", caseFile.noticeType.replaceAll("_", " ")],
    ["Issuer", fields.issuerName],
    ["Reference", fields.noticeReference],
    ["Vehicle", fields.vehicleRegistration],
    ["Amount", fields.amountDue ? `GBP ${fields.amountDue}` : "Needs confirmation"],
    ["Discount", fields.discountedAmount ? `GBP ${fields.discountedAmount}` : "Needs confirmation"],
    ["Issue date", displayDate(fields.issueDate)],
    ["Event date", `${displayDate(fields.contraventionDate)} ${fields.contraventionTime}`],
    ["Location", fields.location],
    ["Reason", fields.reason || "Needs confirmation"]
  ];

  return (
    <section className="premium-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Notice analysis</p>
          <h2 className="mt-2 text-2xl font-black text-app">Extracted case details</h2>
          <p className="mt-2 text-sm text-muted">{caseFile.classificationReason}</p>
        </div>
        <div className="w-48 rounded-3xl border border-app bg-app-surface p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-muted">Confidence</p>
          <ConfidenceBar value={fields.confidence} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {rows.map(([label, value]) => (
          <div key={label} className="micro-card p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</p>
            <p className="mt-2 break-words font-bold text-app">{value || "Not detected yet"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
