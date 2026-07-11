import { RetrievedSource } from "@/lib/types/caseTypes";
import { RagAgentOutput } from "@/lib/types/agentTypes";
import { getRagConfig } from "@/lib/rag/config";
import { retrieveSources } from "@/lib/rag/retrieve";

export async function retrieveRagContext(query: string, limit?: number): Promise<RagAgentOutput> {
  const config = getRagConfig();
  const { sources, modeUsed } = await retrieveSources(query, limit ?? config.defaultLimit);
  const relevantSnippets: RetrievedSource[] = sources;

  return {
    retrievedContext: relevantSnippets.map((source) => `${source.document}: ${source.snippet}`).join("\n\n"),
    sourceDocuments: relevantSnippets.map((source) => source.document),
    relevantSnippets,
    confidence: relevantSnippets.length ? Math.min(0.9, 0.45 + relevantSnippets.length * 0.1) : 0.2,
    modeUsed
  };
}
