import fs from "fs/promises";
import path from "path";

export async function GET() {
  const text = await fs.readFile(path.join(process.cwd(), "data", "demoRejection.txt"), "utf8");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
