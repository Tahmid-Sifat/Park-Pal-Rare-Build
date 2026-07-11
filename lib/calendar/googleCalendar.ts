/** Shared Google Calendar booking / calendar link used by "Add to Calendar". */
export const GOOGLE_CALENDAR_URL =
  process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL || "https://calendar.app.google/qB7itMex4LrGX3a6A";

export function getGoogleCalendarUrl(_options?: {
  title?: string;
  date?: string;
  details?: string;
}) {
  // Appointment schedule / shared calendar link provided for ParkPal deadlines.
  return GOOGLE_CALENDAR_URL;
}
