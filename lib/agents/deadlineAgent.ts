import { Deadline, NoticeFields } from "@/lib/types/caseTypes";
import { addDaysIso } from "@/lib/utils/dateUtils";

const reminders = ["1 day before", "10 minutes before", "5 minutes before"];

export function buildDeadlines(fields: NoticeFields): Deadline[] {
  const deadlines: Deadline[] = [];

  if (fields.appealDeadline) {
    deadlines.push({
      id: "appeal",
      type: "appeal",
      title: "Appeal by",
      date: fields.appealDeadline,
      confidence: fields.rawText.toLowerCase().includes("appeal deadline") ? 0.85 : 0.55,
      sourceText: "Extracted from notice or estimated from issue date. Please verify against the notice.",
      reminders
    });
  }

  if (fields.discountDeadline) {
    deadlines.push({
      id: "discount",
      type: "discount",
      title: "Discount risk date",
      date: fields.discountDeadline,
      confidence: fields.discountedAmount ? 0.72 : 0.48,
      sourceText: "Reduced payment windows vary. Check whether appealing preserves the discount.",
      reminders
    });
  }

  if (fields.paymentDeadline) {
    deadlines.push({
      id: "payment",
      type: "payment",
      title: "Payment deadline",
      date: fields.paymentDeadline,
      confidence: 0.56,
      sourceText: "Estimated when not explicitly stated.",
      reminders
    });
  }

  const evidenceDate = addDaysIso(fields.issueDate, 3);
  if (evidenceDate) {
    deadlines.push({
      id: "evidence",
      type: "evidence",
      title: "Collect evidence",
      date: evidenceDate,
      confidence: 0.9,
      sourceText: "ParkPal suggested reminder so evidence is gathered early.",
      reminders
    });
  }

  return deadlines;
}
