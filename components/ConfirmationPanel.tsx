import { CaseFile } from "@/lib/types/caseTypes";
import { displayDate } from "@/lib/utils/dateUtils";

export function ConfirmationPanel({ caseFile }: { caseFile: CaseFile }) {
  const fields = caseFile.noticeFields;
  const confirmations = [
    ["Notice reference", fields.noticeReference],
    ["Vehicle registration", fields.vehicleRegistration],
    ["Appeal deadline", displayDate(fields.appealDeadline)],
    ["Discount risk date", displayDate(fields.discountDeadline)],
    ["Issuer route", caseFile.likelyRoute]
  ];

  return (
    <section className="premium-card p-6">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Human confirmation</p>
        <h2 className="mt-2 text-2xl font-black text-app">Check extracted details before submitting</h2>
        <p className="mt-2 text-sm text-muted">These details drive the draft and reminders. Tick them off against the official notice.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {confirmations.map(([label, value]) => (
          <label key={label} className="micro-card flex cursor-pointer gap-3 p-4">
            <input className="mt-1 h-4 w-4 accent-[var(--primary)]" type="checkbox" />
            <span>
              <span className="block text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</span>
              <span className="mt-1 block font-semibold text-app">{value || "Needs confirmation"}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
