import { RetrievedSource } from "@/lib/types/caseTypes";
import { loadKnowledgeBase } from "./loadKnowledgeBase";

export async function retrieveKnowledge(query: string, limit = 5): Promise<RetrievedSource[]> {
  const docs = await loadKnowledgeBase();
  const terms = uniqueTerms(query);

  return docs
    .map((doc) => {
      const lower = doc.content.toLowerCase();
      const score = terms.reduce((total, term) => total + (lower.includes(term) ? 1 : 0), 0);
      return {
        document: doc.name,
        snippet: bestSnippet(doc.content, terms),
        score
      };
    })
    .filter((source) => source.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function uniqueTerms(query: string) {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((term) => term.length > 3)
    )
  );
}

function bestSnippet(content: string, terms: string[]) {
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
