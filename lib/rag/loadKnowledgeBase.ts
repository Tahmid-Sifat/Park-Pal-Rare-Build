import fs from "fs/promises";
import path from "path";

export type KnowledgeDoc = {
  name: string;
  content: string;
};

export async function loadKnowledgeBase(): Promise<KnowledgeDoc[]> {
  const dir = path.join(process.cwd(), "knowledge_base");
  const files = await fs.readdir(dir);
  const markdown = files.filter((file) => file.endsWith(".md"));
  return Promise.all(
    markdown.map(async (file) => ({
      name: file,
      content: await fs.readFile(path.join(dir, file), "utf8")
    }))
  );
}
