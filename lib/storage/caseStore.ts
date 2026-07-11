import fs from "fs/promises";
import path from "path";
import { CaseFile } from "@/lib/types/caseTypes";
import { getCaseFileById, persistCaseFile } from "@/lib/db/caseRepository";
import { isDatabaseConfigured } from "@/lib/db/prisma";

const dataDir = path.join(process.cwd(), "data");
const casesPath = path.join(dataDir, "cases.json");

async function readLocalCases(): Promise<CaseFile[]> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(casesPath, "utf8")) as CaseFile[];
  } catch {
    return [];
  }
}

async function saveLocalCase(caseFile: CaseFile) {
  const cases = await readLocalCases();
  const index = cases.findIndex((item) => item.id === caseFile.id);
  if (index >= 0) cases[index] = caseFile;
  else cases.unshift(caseFile);
  await fs.writeFile(casesPath, JSON.stringify(cases, null, 2));
}

/**
 * Persist a case locally (UI demo fallback) and to PostgreSQL when DATABASE_URL is set.
 * Existing UI/agents keep calling this unchanged.
 */
export async function saveCase(caseFile: CaseFile) {
  await saveLocalCase(caseFile);

  if (!isDatabaseConfigured()) return;

  try {
    await persistCaseFile(caseFile);
  } catch (error) {
    console.error("[db] Failed to persist case to PostgreSQL:", error);
  }
}

export async function getCase(id: string) {
  if (isDatabaseConfigured()) {
    try {
      const fromDb = await getCaseFileById(id);
      if (fromDb) return fromDb;
    } catch (error) {
      console.error("[db] Failed to load case from PostgreSQL, falling back to local store:", error);
    }
  }

  const cases = await readLocalCases();
  return cases.find((caseFile) => caseFile.id === id) || null;
}
