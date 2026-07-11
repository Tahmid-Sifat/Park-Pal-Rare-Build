import { RetrievedSource } from "@/lib/types/caseTypes";
import { loadKnowledgeBase } from "./loadKnowledgeBase";

/** Local lexical "embedding" fallback: bag-of-words + cosine similarity (no external API). */
export async function retrieveWithLocalEmbeddings(query: string, limit = 5): Promise<RetrievedSource[]> {
  const docs = await loadKnowledgeBase();
  const queryVector = vectorize(query);

  return docs
    .map((doc) => {
      const docVector = vectorize(doc.content);
      const score = cosineSimilarity(queryVector, docVector);
      const snippet = bestSnippet(doc.content, queryVector);
      return {
        document: doc.name,
        snippet,
        score: Number(score.toFixed(3))
      };
    })
    .filter((source) => source.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** @deprecated Prefer retrieveWithLocalEmbeddings — kept for older imports. */
export async function retrieveWithEmbeddingsFallback(query: string, limit = 5): Promise<RetrievedSource[]> {
  return retrieveWithLocalEmbeddings(query, limit);
}

function vectorize(text: string) {
  return tokens(text).reduce<Record<string, number>>((vector, token) => {
    vector[token] = (vector[token] || 0) + 1;
    return vector;
  }, {});
}

function tokens(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 3)
    .map(stem);
}

function stem(term: string) {
  return term.replace(/(ing|ed|es|s)$/i, "");
}

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  keys.forEach((key) => {
    dot += (a[key] || 0) * (b[key] || 0);
    magA += (a[key] || 0) ** 2;
    magB += (b[key] || 0) ** 2;
  });
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function bestSnippet(content: string, queryVector: Record<string, number>) {
  const paragraphs = content.split(/\n+/).filter((line) => line.trim().length > 60 && !line.startsWith("#"));
  const ranked = paragraphs
    .map((paragraph) => ({ paragraph, score: cosineSimilarity(queryVector, vectorize(paragraph)) }))
    .sort((a, b) => b.score - a.score);
  return (ranked[0]?.paragraph || content.slice(0, 240)).trim();
}
