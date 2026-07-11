import { getGoogleCalendarUrl } from "@/lib/calendar/googleCalendar";
import { getCase } from "@/lib/storage/caseStore";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const caseId = url.searchParams.get("caseId") || "";
  const deadlineId = url.searchParams.get("deadlineId") || "appeal";
  const caseFile = await getCase(caseId);
  const deadline = caseFile?.deadlines.find((item) => item.id === deadlineId);

  const calendarUrl = getGoogleCalendarUrl(
    deadline
      ? {
          title: `ParkPal: ${deadline.title}`,
          date: deadline.date,
          details: deadline.sourceText
        }
      : undefined
  );

  return Response.redirect(calendarUrl, 302);
}
