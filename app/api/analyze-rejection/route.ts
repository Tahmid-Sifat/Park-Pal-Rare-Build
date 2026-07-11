import { analyzeRejectionText } from "@/lib/agents/rejectionAnalyzerAgent";
import { getCase, saveCase } from "@/lib/storage/caseStore";

export async function POST(request: Request) {
  const body = await request.json();
  const caseFile = body.caseId ? await getCase(body.caseId) : null;
  const analysis = await analyzeRejectionText(body.rejectionText || "", caseFile);

  if (caseFile) {
    const { retrievedSources, retrievedContext, ragModeUsed, ...rejectionAnalysis } = analysis;
    await saveCase({
      ...caseFile,
      status: analysis.escalationRoute.includes("Urgent") ? "escalation_needed" : "rejected",
      rejectionAnalysis,
      retrievedSources: retrievedSources.length ? retrievedSources : caseFile.retrievedSources,
      retrievedContext: retrievedContext || caseFile.retrievedContext,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...caseFile.timeline,
        {
          id: `rejection-${Date.now()}`,
          label: "Rejection analysed",
          detail: `${analysis.escalationRoute} (RAG: ${ragModeUsed}; ${retrievedSources.map((s) => s.document).join(", ") || "no sources"})`,
          createdAt: new Date().toISOString()
        }
      ]
    });
  }

  return Response.json(analysis);
}
