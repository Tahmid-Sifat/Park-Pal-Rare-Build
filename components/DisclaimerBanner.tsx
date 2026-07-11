import { ShieldAlert } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <aside className="rounded-[1.5rem] border border-app bg-app-surface p-4 text-sm leading-6 text-muted">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl" style={{ background: "color-mix(in srgb, var(--warning) 16%, transparent)", color: "var(--warning)" }}>
          <ShieldAlert className="h-5 w-5" />
        </span>
        <p>
          <strong className="text-app">Demo prototype, not legal advice.</strong> ParkPal provides informational support only. Always verify deadlines, appeal rules, and official instructions with the notice, official sources, or a qualified adviser before taking action.
        </p>
      </div>
    </aside>
  );
}
