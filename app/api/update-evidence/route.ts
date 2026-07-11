import { updateEvidence } from "@/lib/agents/evidenceUpdateAgent";
import { saveEvidenceFiles } from "@/lib/storage/evidenceFileStore";
import { getCase, saveCase } from "@/lib/storage/caseStore";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("multipart/form-data") ? await readFormBody(request) : await request.json();
  const caseFile = await getCase(body.caseId);
  if (!caseFile) return Response.json({ error: "Case not found" }, { status: 404 });

  const attachments = body.files?.length ? await saveEvidenceFiles(caseFile.id, body.files) : [];
  const updated = updateEvidence(
    caseFile,
    typeof body.evidenceText === "string" ? body.evidenceText : "",
    attachments.length ? attachments.map((file) => file.fileName) : Array.isArray(body.uploadedFileNames) ? body.uploadedFileNames : [],
    Boolean(body.useDemoEvidence)
  );
  updated.evidenceAttachments = [...(caseFile.evidenceAttachments || []), ...attachments];
  await saveCase(updated);
  return Response.json(updated);
}

async function readFormBody(request: Request) {
  const form = await request.formData();
  return {
    caseId: String(form.get("caseId") || ""),
    evidenceText: String(form.get("evidenceText") || ""),
    useDemoEvidence: form.get("useDemoEvidence") === "true",
    files: form.getAll("files").filter((item): item is File => item instanceof File)
  };
}
