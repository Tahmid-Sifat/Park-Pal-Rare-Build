import fs from "fs/promises";
import path from "path";
import { CaseFile } from "@/lib/types/caseTypes";

const dataDir = path.join(process.cwd(), "data");
const casesPath = path.join(dataDir, "cases.json");

async function readCases(): Promise<CaseFile[]> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(casesPath, "utf8")) as CaseFile[];
  } catch {
    return [];
  }
}

export async function saveCase(caseFile: CaseFile) {
  const cases = await readCases();
  const index = cases.findIndex((item) => item.id === caseFile.id);
  if (index >= 0) cases[index] = caseFile;
  else cases.unshift(caseFile);
  await fs.writeFile(casesPath, JSON.stringify(cases, null, 2));
}

export async function getCase(id: string) {
  const cases = await readCases();
  return cases.find((caseFile) => caseFile.id === id) || null;
}
