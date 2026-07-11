import { NoticeFields } from "@/lib/types/caseTypes";
import { addDaysIso, todayIso } from "@/lib/utils/dateUtils";
import { extractFirst, moneyToNumber, toIsoDate } from "@/lib/utils/textUtils";

export function readNotice(rawText: string): NoticeFields {
  const text = rawText.trim();
  const issueDate = toIsoDate(
    extractFirst([/issue date[:\s]+([^\n]+)/i, /date of issue[:\s]+([^\n]+)/i], text) || todayIso()
  );
  const contraventionDate = toIsoDate(
    extractFirst([/contravention date[:\s]+([^\n]+)/i, /date of event[:\s]+([^\n]+)/i, /parking event[:\s]+([^\n]+)/i], text) ||
      issueDate
  );
  const amount = extractFirst([/amount(?: due)?[:\s]+[^\d\n]*([\d.]+)/i, /parking charge[:\s]+[^\d\n]*([\d.]+)/i], text);
  const discount = extractFirst([/discount(?:ed)? amount[:\s]+[^\d\n]*([\d.]+)/i, /[^\d\n]*([\d.]+)\s+if paid within 14 days/i], text);
  const explicitAppeal = extractFirst([/appeal deadline[:\s]+([^\n]+)/i, /appeal by[:\s]+([^\n]+)/i], text);
  const explicitPayment = extractFirst([/payment deadline[:\s]+([^\n]+)/i, /pay by[:\s]+([^\n]+)/i], text);
  const explicitDiscount = extractFirst([/discount deadline[:\s]+([^\n]+)/i, /discount.*?by[:\s]+([^\n]+)/i], text);

  const issuer = extractFirst([/issuer[:\s]+([^\n]+)/i, /operator[:\s]+([^\n]+)/i, /^([A-Z][A-Za-z &]+(?:Parking|Council|Authority)[^\n]*)/m], text);
  const ref = extractFirst([/notice reference[:\s]+([A-Z0-9-]+)/i, /reference(?: number)?[:\s]+([A-Z0-9-]+)/i, /pcn(?: number)?[:\s]+([A-Z0-9-]+)/i], text);

  const filled: NoticeFields = {
    issuerName: issuer || "Unknown issuer",
    noticeReference: ref || "Needs confirmation",
    vehicleRegistration:
      extractFirst([/vehicle registration[:\s]+([A-Z0-9 ]+)/i, /vrm[:\s]+([A-Z0-9 ]+)/i, /registration[:\s]+([A-Z0-9 ]+)/i], text) ||
      "Needs confirmation",
    issueDate,
    contraventionDate,
    contraventionTime:
      extractFirst([/contravention time[:\s]+([0-9:]+)/i, /time(?: of event)?[:\s]+([0-9:]+)/i], text) || "Needs confirmation",
    location: extractFirst([/location[:\s]+([^\n]+)/i, /site[:\s]+([^\n]+)/i], text) || "Needs confirmation",
    amountDue: moneyToNumber(amount),
    discountedAmount: moneyToNumber(discount),
    paymentDeadline: explicitPayment ? toIsoDate(explicitPayment) : addDaysIso(issueDate, 28),
    appealDeadline: explicitAppeal ? toIsoDate(explicitAppeal) : addDaysIso(issueDate, 28),
    discountDeadline: explicitDiscount ? toIsoDate(explicitDiscount) : addDaysIso(issueDate, 14),
    appealUrl: extractFirst([/appeal(?: at| online)?[:\s]+(https?:\/\/[^\s]+)/i], text) || null,
    paymentUrl: extractFirst([/pay(?: at| online)?[:\s]+(https?:\/\/[^\s]+)/i], text) || null,
    reason: extractFirst([/reason[:\s]+([^\n]+)/i, /contravention[:\s]+([^\n]+)/i], text) || null,
    rawText: text,
    confidence: text.length > 100 ? 0.78 : 0.45
  };

  return filled;
}
