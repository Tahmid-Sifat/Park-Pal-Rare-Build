import { RetrievedSource } from "@/lib/types/caseTypes";
import { getRagConfig } from "./config";
import { KnowledgeDoc, loadKnowledgeBase } from "./loadKnowledgeBase";
import { ensureSystemCertificates } from "@/lib/llm/systemCa";

type EmbeddingCache = {
  model: string;
  baseUrl: string;
  vectors: Map<string, number[]>;
};

let embeddingCache: EmbeddingCache | null = null;

export async function retrieveWithOllamaEmbeddings(query: string, limit = 5): Promise<RetrievedSource[]> {
  ensureSystemCertificates();
  const config = getRagConfig();
  const baseUrl = config.ollamaEmbedBaseUrl;
  const model = config.ollamaEmbeddingModel;
  // Local embeds usually need no key; only send a key if one is configured for that host.
  const isLocal = /localhost|127\.0\.0\.1/.test(baseUrl);
  const apiKey = isLocal ? undefined : config.ollamaApiKey || undefined;

  if (!isLocal && !apiKey) {
    throw new Error("OLLAMA_API_KEY is required for non-local Ollama embeddings");
  }

  const docs = await loadKnowledgeBase();
  await ensureDocEmbeddings(docs, baseUrl, apiKey, model);

  const queryVector = await embedText(query, baseUrl, apiKey, model);

  return docs
    .map((doc) => {
      const docVector = embeddingCache?.vectors.get(doc.name);
      if (!docVector) {
        return { document: doc.name, snippet: doc.content.slice(0, 240).trim(), score: 0 };
      }
      const score = cosineSimilarity(queryVector, docVector);
      return {
        document: doc.name,
        snippet: bestSnippet(doc.content, query),
        score: Number(score.toFixed(4))
      };
    })
    .filter((source) => source.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function ensureDocEmbeddings(docs: KnowledgeDoc[], baseUrl: string, apiKey: string | undefined, model: string) {
  if (
    embeddingCache?.model === model &&
    embeddingCache.baseUrl === baseUrl &&
    embeddingCache.vectors.size === docs.length
  ) {
    return;
  }

  const vectors = new Map<string, number[]>();
  for (const doc of docs) {
    vectors.set(doc.name, await embedText(doc.content, baseUrl, apiKey, model));
  }
  embeddingCache = { model, baseUrl, vectors };
}

async function embedText(text: string, baseUrl: string, apiKey: string | undefined, model: string): Promise<number[]> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const native = await fetch(`${baseUrl}/api/embed`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      input: text.slice(0, 8000)
    })
  });

  if (native.ok) {
    const data = (await native.json()) as { embeddings?: number[][]; embedding?: number[] };
    const vector = data.embeddings?.[0] || data.embedding;
    if (vector?.length) return vector;
  }

  const detail = native.ok ? "empty embedding payload" : await native.text();
  throw new Error(`Ollama embeddings failed at ${baseUrl}: ${native.status} ${detail.slice(0, 300)}`);
}

function cosineSimilarity(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function bestSnippet(content: string, query: string) {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 3);
  const paragraphs = content.split(/\n+/).filter((line) => line.trim().length > 60 && !line.startsWith("#"));
  const ranked = paragraphs
    .map((paragraph) => {
      const lower = paragraph.toLowerCase();
      const score = terms.reduce((total, term) => total + (lower.includes(term) ? 1 : 0), 0);
      return { paragraph, score };
    })
    .sort((a, b) => b.score - a.score);
  return (ranked[0]?.paragraph || content.slice(0, 240)).trim();
}
