import { analyzeRejectionText } from "@/lib/agents/rejectionAnalyzerAgent";
import { getCase, saveCase } from "@/lib/storage/caseStore";

export async function POST(request: Request) {
  const body = await request.json();
  const analysis = analyzeRejectionText(body.rejectionText || "");
  const caseFile = await getCase(body.caseId);
  if (caseFile) {
    await saveCase({
      ...caseFile,
      status: analysis.escalationRoute.includes("Urgent") ? "escalation_needed" : "rejected",
      rejectionAnalysis: analysis,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...caseFile.timeline,
        { id: `rejection-${Date.now()}`, label: "Rejection analysed", detail: analysis.escalationRoute, createdAt: new Date().toISOString() }
      ]
    });
  }
  return Response.json(analysis);
}
