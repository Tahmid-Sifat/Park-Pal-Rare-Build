import { regenerateAppeal } from "@/lib/agents/orchestrator";
import { getCase } from "@/lib/storage/caseStore";

export async function POST(request: Request) {
  const body = await request.json();
  const caseFile = await getCase(body.caseId);
  if (!caseFile) return Response.json({ error: "Case not found" }, { status: 404 });
  const updated = await regenerateAppeal(caseFile, body.selectedGroundIds || [], body.tone || "Calm and factual");
  return Response.json(updated);
}
