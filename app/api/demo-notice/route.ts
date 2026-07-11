import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  const scenario = new URL(request.url).searchParams.get("scenario");
  const fileName = scenario === "council" ? "demoCouncilNotice.txt" : "demoNotice.txt";
  const text = await fs.readFile(path.join(process.cwd(), "data", fileName), "utf8");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
