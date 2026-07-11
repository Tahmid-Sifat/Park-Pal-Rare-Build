import { RetrievedSource } from "@/lib/types/caseTypes";
import { RagAgentOutput } from "@/lib/types/agentTypes";
import { retrieveWithEmbeddingsFallback } from "@/lib/rag/embeddingRetriever";

export async function retrieveRagContext(query: string, limit = 5): Promise<RagAgentOutput> {
  const relevantSnippets: RetrievedSource[] = await retrieveWithEmbeddingsFallback(query, limit);
  return {
    retrievedContext: relevantSnippets.map((source) => `${source.document}: ${source.snippet}`).join("\n\n"),
    sourceDocuments: relevantSnippets.map((source) => source.document),
    relevantSnippets,
    confidence: relevantSnippets.length ? Math.min(0.9, 0.45 + relevantSnippets.length * 0.1) : 0.2
  };
}
