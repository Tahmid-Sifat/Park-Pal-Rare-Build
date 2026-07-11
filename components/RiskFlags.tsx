import { AlertTriangle, ShieldAlert } from "lucide-react";

export function RiskFlags({ flags }: { flags: string[] }) {
  if (!flags.length) {
    return (
      <section className="premium-card p-6">
        <h2 className="flex items-center gap-2 text-2xl font-black text-app"><ShieldAlert className="h-6 w-6 text-primary" /> Risk Guard</h2>
        <p className="mt-3 text-sm text-muted">No major warnings detected. Still verify dates and facts before submitting.</p>
      </section>
    );
  }
  return (
    <section className="premium-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "color-mix(in srgb, var(--warning) 18%, transparent)", color: "var(--warning)" }}>
          <AlertTriangle className="h-6 w-6" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Risk Guard</p>
          <h2 className="text-2xl font-black text-app">Check these before acting</h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {flags.map((flag) => (
          <div key={flag} className="micro-card p-4 text-sm font-semibold leading-6 text-app">
            {flag}
          </div>
        ))}
      </div>
    </section>
  );
}
