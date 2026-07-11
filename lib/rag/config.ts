export type RagMode = "keyword" | "local" | "openai" | "ollama";
export type EmbeddingProvider = "none" | "openai" | "ollama";

export type RagConfig = {
  mode: RagMode;
  embeddingProvider: EmbeddingProvider;
  openaiApiKey: string | null;
  openaiEmbeddingModel: string;
  ollamaApiKey: string | null;
  /** Chat / generate host (often https://ollama.com). */
  ollamaBaseUrl: string;
  /** Embeddings host (local Ollama by default). */
  ollamaEmbedBaseUrl: string;
  ollamaEmbeddingModel: string;
  defaultLimit: number;
};

function parseMode(value: string | undefined): RagMode {
  const normalized = (value || "keyword").toLowerCase().trim();
  if (normalized === "embedding" || normalized === "local") return "local";
  if (normalized === "openai") return "openai";
  if (normalized === "ollama") return "ollama";
  return "keyword";
}

function parseEmbeddingProvider(value: string | undefined): EmbeddingProvider {
  const normalized = (value || "none").toLowerCase().trim();
  if (normalized === "openai") return "openai";
  if (normalized === "ollama") return "ollama";
  return "none";
}

export function getRagConfig(): RagConfig {
  const mode = parseMode(process.env.RAG_MODE);
  const embeddingProvider = parseEmbeddingProvider(process.env.EMBEDDING_PROVIDER);
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim() || null;
  const ollamaApiKey = process.env.OLLAMA_API_KEY?.trim() || null;
  const ollamaBaseUrl = (process.env.OLLAMA_BASE_URL || "https://ollama.com").replace(/\/$/, "");
  // Embeddings use a separate local host so chat can stay on Ollama Cloud.
  const ollamaEmbedBaseUrl = (
    process.env.OLLAMA_EMBED_BASE_URL ||
    process.env.OLLAMA_EMBEDDINGS_URL ||
    "http://127.0.0.1:11434"
  ).replace(/\/$/, "");

  let resolvedMode = mode;
  if (mode === "openai" && (!openaiApiKey || embeddingProvider === "none")) {
    resolvedMode = "local";
  }

  return {
    mode: resolvedMode,
    embeddingProvider,
    openaiApiKey,
    openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    ollamaApiKey,
    ollamaBaseUrl,
    ollamaEmbedBaseUrl,
    ollamaEmbeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
    defaultLimit: 5
  };
}
