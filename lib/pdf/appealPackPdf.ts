import { CaseFile } from "@/lib/types/caseTypes";
import { displayDate } from "@/lib/utils/dateUtils";

export function appealPackPdf(caseFile: CaseFile) {
  const fields = caseFile.noticeFields;
  const lines = [
    "ParkPal appeal pack",
    "",
    "Informational support only. Verify all details against the official notice.",
    "",
    `Issuer: ${fields.issuerName}`,
    `Reference: ${fields.noticeReference}`,
    `Vehicle: ${fields.vehicleRegistration}`,
    `Location: ${fields.location}`,
    `Amount: ${fields.amountDue ?? "Needs confirmation"}`,
    `Notice type: ${caseFile.noticeType}`,
    "",
    "Deadlines:",
    ...caseFile.deadlines.map((deadline) => `- ${deadline.title}: ${displayDate(deadline.date)} (${deadline.sourceText})`),
    "",
    "Appeal grounds:",
    ...caseFile.appealGrounds.map((ground) => `- ${ground.title}: ${ground.whyItMayApply} Strength: ${ground.strength}.`),
    "",
    "Evidence checklist:",
    ...caseFile.evidenceItems.map((item) => `- ${item.name}: ${item.status}. ${item.whyNeeded}`),
    ...(caseFile.evidenceAttachments?.length
      ? ["", "Stored evidence files:", ...caseFile.evidenceAttachments.map((file) => `- ${file.fileName} (${Math.ceil(file.size / 1024)} KB)`)]
      : []),
    "",
    "Appeal draft:",
    caseFile.draftFull
  ];

  return buildSinglePagePdf(wrapLines(lines, 94));
}

function buildSinglePagePdf(lines: string[]) {
  const content = [
    "BT",
    "/F1 10 Tf",
    "50 790 Td",
    "14 TL",
    ...lines.slice(0, 52).map((line) => `(${escapePdfText(line)}) Tj T*`),
    "ET"
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

function wrapLines(lines: string[], width: number) {
  return lines.flatMap((line) => {
    if (!line) return [""];
    const words = line.split(/\s+/);
    const wrapped: string[] = [];
    let current = "";
    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > width) {
        wrapped.push(current);
        current = word;
      } else {
        current = next;
      }
    });
    if (current) wrapped.push(current);
    return wrapped;
  });
}

function escapePdfText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
