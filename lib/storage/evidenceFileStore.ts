import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { EvidenceAttachment } from "@/lib/types/caseTypes";

const evidenceRoot = path.join(process.cwd(), "data", "evidence");

export async function saveEvidenceFiles(caseId: string, files: File[]): Promise<EvidenceAttachment[]> {
  if (!files.length) return [];
  const caseDir = path.join(evidenceRoot, safeSegment(caseId));
  await fs.mkdir(caseDir, { recursive: true });

  return Promise.all(
    files.map(async (file) => {
      const id = randomUUID();
      const fileName = safeFileName(file.name || "evidence-file");
      const storedName = `${id}-${fileName}`;
      await fs.writeFile(path.join(caseDir, storedName), Buffer.from(await file.arrayBuffer()));
      return {
        id,
        fileName,
        storedName,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
    })
  );
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
}

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 140);
}
