import fs from "fs/promises";
import path from "path";

export type KnowledgeDoc = {
  name: string;
  content: string;
};

let cachedDocs: KnowledgeDoc[] | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000;

export async function loadKnowledgeBase(forceRefresh = false): Promise<KnowledgeDoc[]> {
  const now = Date.now();
  if (!forceRefresh && cachedDocs && now - cachedAt < CACHE_TTL_MS) {
    return cachedDocs;
  }

  const dir = path.join(process.cwd(), "knowledge_base");
  const files = await fs.readdir(dir);
  const markdown = files.filter((file) => file.endsWith(".md"));
  cachedDocs = await Promise.all(
    markdown.map(async (file) => ({
      name: file,
      content: await fs.readFile(path.join(dir, file), "utf8")
    }))
  );
  cachedAt = now;
  return cachedDocs;
}

export function clearKnowledgeBaseCache() {
  cachedDocs = null;
  cachedAt = 0;
}
