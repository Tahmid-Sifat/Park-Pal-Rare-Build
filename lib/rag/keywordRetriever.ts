import { RetrievedSource } from "@/lib/types/caseTypes";
import { loadKnowledgeBase } from "./loadKnowledgeBase";

export async function retrieveKnowledge(query: string, limit = 5): Promise<RetrievedSource[]> {
  const docs = await loadKnowledgeBase();
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 3);

  return docs
    .map((doc) => {
      const lower = doc.content.toLowerCase();
      const score = terms.reduce((total, term) => total + (lower.includes(term) ? 1 : 0), 0);
      const firstUseful = doc.content
        .split(/\n+/)
        .find((line) => line.trim().length > 80 && !line.startsWith("#"));
      return {
        document: doc.name,
        snippet: (firstUseful || doc.content.slice(0, 240)).trim(),
        score
      };
    })
    .filter((source) => source.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
