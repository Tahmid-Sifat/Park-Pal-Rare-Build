import { CaseFile } from "@/lib/types/caseTypes";
import { displayDate } from "@/lib/utils/dateUtils";

export function appealPackHtml(caseFile: CaseFile) {
  const fields = caseFile.noticeFields;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ParkPal appeal pack ${fields.noticeReference}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #172026; margin: 40px; line-height: 1.45; }
    h1, h2 { color: #1f7a5a; }
    section { margin-bottom: 28px; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .flag { background: #fff4d6; padding: 8px 10px; margin: 6px 0; }
    pre { white-space: pre-wrap; font-family: inherit; }
  </style>
</head>
<body>
  <h1>ParkPal appeal pack</h1>
  <p><strong>Disclaimer:</strong> ParkPal is a hackathon demo that provides informational support only. It is not legal advice and does not replace a qualified legal professional. Always check the notice, deadlines, and official appeal instructions yourself.</p>
  <section>
    <h2>Case summary</h2>
    <table>
      <tr><th>Issuer</th><td>${fields.issuerName}</td></tr>
      <tr><th>Reference</th><td>${fields.noticeReference}</td></tr>
      <tr><th>Vehicle</th><td>${fields.vehicleRegistration}</td></tr>
      <tr><th>Location</th><td>${fields.location}</td></tr>
      <tr><th>Amount</th><td>${fields.amountDue ?? "Needs confirmation"}</td></tr>
      <tr><th>Notice type</th><td>${caseFile.noticeType}</td></tr>
    </table>
  </section>
  <section>
    <h2>Deadline timeline</h2>
    <ul>${caseFile.deadlines.map((deadline) => `<li>${deadline.title}: ${displayDate(deadline.date)} (${Math.round(deadline.confidence * 100)}% confidence)</li>`).join("")}</ul>
  </section>
  <section>
    <h2>Appeal grounds</h2>
    <ul>${caseFile.appealGrounds.map((ground) => `<li><strong>${ground.title}</strong> - ${ground.whyItMayApply} Strength: ${ground.strength}.</li>`).join("")}</ul>
  </section>
  <section>
    <h2>Evidence checklist</h2>
    <ul>${caseFile.evidenceItems.map((item) => `<li>${item.name}: ${item.status}. ${item.whyNeeded}</li>`).join("")}</ul>
    ${caseFile.evidenceAttachments?.length ? `<h3>Stored evidence files</h3><ul>${caseFile.evidenceAttachments.map((file) => `<li>${file.fileName} (${Math.ceil(file.size / 1024)} KB)</li>`).join("")}</ul>` : ""}
  </section>
  <section>
    <h2>Risk flags</h2>
    ${caseFile.riskFlags.map((flag) => `<div class="flag">${flag}</div>`).join("")}
  </section>
  <section>
    <h2>Appeal draft</h2>
    <pre>${caseFile.draftFull}</pre>
  </section>
</body>
</html>`;
}
