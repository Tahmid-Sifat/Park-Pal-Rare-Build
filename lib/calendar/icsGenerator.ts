import { CaseFile, Deadline } from "@/lib/types/caseTypes";

export function generateIcs(caseFile: CaseFile, deadline: Deadline) {
  const date = deadline.date.replaceAll("-", "");
  const uid = `${caseFile.id}-${deadline.id}@parkpal.local`;
  const description = [
    `Notice reference: ${caseFile.noticeFields.noticeReference}`,
    `Issuer: ${caseFile.noticeFields.issuerName}`,
    `Amount: ${caseFile.noticeFields.amountDue ? `GBP ${caseFile.noticeFields.amountDue}` : "Needs confirmation"}`,
    deadline.sourceText,
    "ParkPal is informational support only. Verify against the official notice."
  ].join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ParkPal//Parking Notice Deadline//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${date}`,
    `SUMMARY:${escapeText(`ParkPal: ${deadline.title}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:ParkPal reminder",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT10M",
    "ACTION:DISPLAY",
    "DESCRIPTION:ParkPal reminder",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT5M",
    "ACTION:DISPLAY",
    "DESCRIPTION:ParkPal reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function escapeText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}
