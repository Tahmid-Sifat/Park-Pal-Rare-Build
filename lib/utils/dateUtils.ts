export function addDaysIso(date: string, days: number) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function displayDate(date: string | null) {
  if (!date) return "Needs confirmation";
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(parsed);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
