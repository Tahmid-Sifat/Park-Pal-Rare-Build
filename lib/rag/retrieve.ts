import { RetrievedSource } from "@/lib/types/caseTypes";
import { getRagConfig, RagMode } from "./config";
import { retrieveWithLocalEmbeddings } from "./embeddingRetriever";
import { retrieveKnowledge } from "./keywordRetriever";
import { retrieveWithOllamaEmbeddings } from "./ollamaEmbeddingRetriever";
import { retrieveWithOpenAIEmbeddings } from "./openaiEmbeddingRetriever";

export type RetrievalResult = {
  sources: RetrievedSource[];
  modeUsed: RagMode;
  query: string;
};

/**
 * Unified RAG entry point. Routes by RAG_MODE:
 * - keyword: term overlap scoring
 * - local / embedding: bag-of-words cosine (no API)
 * - openai: OpenAI embeddings
 * - ollama: Ollama /api/embed (cloud or local)
 * Falls back to local lexical retrieval on provider failure.
 */
export async function retrieveSources(query: string, limit?: number): Promise<RetrievalResult> {
  const config = getRagConfig();
  const resolvedLimit = limit ?? config.defaultLimit;

  try {
    if (config.mode === "ollama") {
      const sources = await retrieveWithOllamaEmbeddings(query, resolvedLimit);
      return { sources, modeUsed: "ollama", query };
    }

    if (config.mode === "openai") {
      const sources = await retrieveWithOpenAIEmbeddings(query, resolvedLimit);
      return { sources, modeUsed: "openai", query };
    }

    if (config.mode === "local") {
      const sources = await retrieveWithLocalEmbeddings(query, resolvedLimit);
      return { sources, modeUsed: "local", query };
    }

    const sources = await retrieveKnowledge(query, resolvedLimit);
    return { sources, modeUsed: "keyword", query };
  } catch (error) {
    const sources = await retrieveWithLocalEmbeddings(query, resolvedLimit);
    console.warn("[rag] retrieval failed, falling back to local lexical mode:", error);
    return { sources, modeUsed: "local", query };
  }
}
