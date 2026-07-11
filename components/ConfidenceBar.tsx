export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="h-2 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-fern" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-steel">{pct}% confidence</span>
    </div>
  );
}
