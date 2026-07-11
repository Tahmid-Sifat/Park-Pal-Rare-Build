import { generateIcs } from "@/lib/calendar/icsGenerator";
import { getCase } from "@/lib/storage/caseStore";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const caseId = url.searchParams.get("caseId") || "";
  const deadlineId = url.searchParams.get("deadlineId") || "appeal";
  const caseFile = await getCase(caseId);
  const deadline = caseFile?.deadlines.find((item) => item.id === deadlineId);
  if (!caseFile || !deadline) return new Response("Not found", { status: 404 });
  const ics = generateIcs(caseFile, deadline);
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="parkpal-${deadline.id}-deadline.ics"`
    }
  });
}
