import { RetrievedSource } from "@/lib/types/caseTypes";
import { getRagConfig } from "./config";
import { KnowledgeDoc, loadKnowledgeBase } from "./loadKnowledgeBase";

type EmbeddingCache = {
  model: string;
  vectors: Map<string, number[]>;
};

let embeddingCache: EmbeddingCache | null = null;

export async function retrieveWithOpenAIEmbeddings(query: string, limit = 5): Promise<RetrievedSource[]> {
  const config = getRagConfig();
  if (!config.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is required for RAG_MODE=openai");
  }

  const docs = await loadKnowledgeBase();
  await ensureDocEmbeddings(docs, config.openaiApiKey, config.openaiEmbeddingModel);

  const queryVector = await embedText(query, config.openaiApiKey, config.openaiEmbeddingModel);

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

async function ensureDocEmbeddings(docs: KnowledgeDoc[], apiKey: string, model: string) {
  if (embeddingCache?.model === model && embeddingCache.vectors.size === docs.length) {
    return;
  }

  const vectors = new Map<string, number[]>();
  for (const doc of docs) {
    vectors.set(doc.name, await embedText(doc.content, apiKey, model));
  }
  embeddingCache = { model, vectors };
}

async function embedText(text: string, apiKey: string, model: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: text.slice(0, 8000)
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI embeddings failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
  return data.data[0].embedding;
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
