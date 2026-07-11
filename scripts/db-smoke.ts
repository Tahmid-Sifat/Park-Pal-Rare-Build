/**
 * Quick DB smoke: ensure default user + persist a minimal case, then delete it.
 */
import fs from "fs";
import path from "path";
import { ensureSystemCertificates } from "../lib/llm/systemCa";

ensureSystemCertificates();

for (const file of [".env.local", ".env"]) {
  const envPath = path.join(process.cwd(), file);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  const { ensureDefaultUser, createCase, getCaseById, deleteCase, listCases } = await import("../lib/db/caseRepository");
  const { randomUUID } = await import("crypto");

  const user = await ensureDefaultUser();
  console.log(`PASS  default user — ${user.email} (${user.id})`);

  const id = randomUUID();
  const now = new Date().toISOString();
  const caseFile = {
    id,
    createdAt: now,
    updatedAt: now,
    status: "draft_ready" as const,
    noticeType: "private_parking_charge" as const,
    noticeFields: {
      issuerName: "Metro Retail Park Parking Ltd",
      noticeReference: "MRP-DB-TEST",
      vehicleRegistration: "AB12 CDE",
      issueDate: "10/05/2026",
      contraventionDate: "07/05/2026",
      contraventionTime: "14:18",
      location: "Metro Retail Park",
      amountDue: 100,
      discountedAmount: 60,
      paymentDeadline: "07/06/2026",
      appealDeadline: "07/06/2026",
      discountDeadline: null,
      appealUrl: null,
      paymentUrl: null,
      reason: "No valid payment",
      rawText: "DB smoke test notice text",
      confidence: 0.96
    },
    classificationReason: "smoke",
    likelyRoute: "Operator appeal then POPLA",
    redFlags: [],
    deadlines: [
      {
        id: "appeal",
        type: "appeal" as const,
        title: "Appeal by 7 Jun 2026",
        date: "2026-06-07",
        confidence: 0.85,
        sourceText: "smoke",
        reminders: []
      }
    ],
    evidenceItems: [{ id: "e1", name: "Entrance photo", whyNeeded: "signage", status: "uploaded" as const }],
    appealGrounds: [
      {
        id: "g1",
        title: "Poor signage",
        description: "x",
        whyItMayApply: "x",
        requiredEvidence: [],
        availableEvidence: [],
        strength: "possible" as const,
        confidence: 0.8,
        sourceRefs: [],
        warnings: []
      },
      {
        id: "g2",
        title: "Grace period",
        description: "x",
        whyItMayApply: "x",
        requiredEvidence: [],
        availableEvidence: [],
        strength: "possible" as const,
        confidence: 0.7,
        sourceRefs: [],
        warnings: []
      }
    ],
    draftShort: "Short appeal",
    draftFull: "Full appeal letter for smoke test",
    riskFlags: [],
    nextActions: ["Appeal"],
    timeline: [],
    retrievedSources: []
  };

  await createCase({ caseFile, ocrText: caseFile.noticeFields.rawText });
  const created = await getCaseById(id);
  if (!created) throw new Error("case not found after create");
  console.log(
    `PASS  create case — ${created.id} analyses=${created.aiAnalyses.length} evidence=${created.evidence.length} reminders=${created.reminders.length}`
  );

  const loaded = created;
  const analysis = loaded.aiAnalyses[0]?.analysisJson as { grounds?: string[]; recommendedEvidence?: string[] };
  console.log(
    `PASS  read case — grounds=${JSON.stringify(analysis?.grounds)} evidence=${JSON.stringify(analysis?.recommendedEvidence)}`
  );

  const listed = await listCases({ take: 5 });
  console.log(`PASS  list cases — count=${listed.length}`);

  await deleteCase(id);
  console.log("PASS  delete case");
  console.log("\n=== DB SMOKE PASSED ===");
}

main().catch((error) => {
  console.error("FAIL  db smoke:", error);
  process.exit(1);
});
