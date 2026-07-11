/** Shared Google Calendar booking / calendar link used by "Add to Calendar". */
export const GOOGLE_CALENDAR_URL =
  process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL || "https://calendar.app.google/qB7itMex4LrGX3a6A";

export function getGoogleCalendarUrl(_options?: {
  title?: string;
  date?: string;
  details?: string;
}) {
  if (!_options?.title || !_options.date) return GOOGLE_CALENDAR_URL;

  const date = toGoogleDate(_options.date);
  if (!date) return GOOGLE_CALENDAR_URL;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: _options.title,
    dates: `${date}/${date}`,
    details: _options.details || "ParkPal parking notice reminder. Verify the deadline against the official notice."
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toGoogleDate(value: string) {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}${iso[2]}${iso[3]}`;

  const parsed = new Date(`${value} 12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return [parsed.getFullYear(), String(parsed.getMonth() + 1).padStart(2, "0"), String(parsed.getDate()).padStart(2, "0")].join("");
}
