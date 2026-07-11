import { analyzeNotice } from "@/lib/agents/orchestrator";
import { extractNoticeText } from "@/lib/ocr/extractNoticeText";
import { saveCase } from "@/lib/storage/caseStore";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const pastedText = String(form.get("noticeText") || "");
    const extracted = file instanceof File ? await extractNoticeText(file, pastedText) : { text: pastedText, warnings: [] };
    const caseFile = await analyzeNotice(extracted.text || pastedText, { demoEvidence: form.get("demoEvidence") === "true" });
    if (extracted.warnings.length) {
      caseFile.riskFlags = Array.from(new Set([...caseFile.riskFlags, ...extracted.warnings]));
      caseFile.updatedAt = new Date().toISOString();
      await saveCase(caseFile);
    }
    return Response.json(caseFile);
  }

  const body = await request.json();
  const noticeText = typeof body.noticeText === "string" ? body.noticeText : JSON.stringify(body.noticeText ?? "");
  const caseFile = await analyzeNotice(noticeText, { demoEvidence: Boolean(body.demoEvidence) });
  return Response.json(caseFile);
}
