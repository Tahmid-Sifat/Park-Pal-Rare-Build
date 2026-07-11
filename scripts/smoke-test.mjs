import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import tls from "tls";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(path.join(__dirname, ".."));

const tlsApi = tls;
if (typeof tlsApi.getCACertificates === "function" && typeof tlsApi.setDefaultCACertificates === "function") {
  tlsApi.setDefaultCACertificates(tlsApi.getCACertificates("system"));
}

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local missing");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function pass(name, detail = "") {
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, err) {
  console.error(`FAIL  ${name} — ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}

async function testLocalEmbed() {
  const base = (process.env.OLLAMA_EMBED_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";
  const res = await fetch(`${base}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: "POPLA rejection escalation deadline" })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  const dims = data.embeddings?.[0]?.length || data.embedding?.length || 0;
  if (dims < 64) throw new Error(`unexpected dims=${dims}`);
  pass("local nomic embeddings", `${model} dims=${dims} @ ${base}`);
}

async function testCloudChat() {
  const base = (process.env.OLLAMA_BASE_URL || "https://ollama.com").replace(/\/$/, "");
  const key = process.env.OLLAMA_API_KEY;
  const model = process.env.OLLAMA_MODEL || "gpt-oss:120b";
  if (!key) throw new Error("OLLAMA_API_KEY missing");
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: "user", content: "Reply with exactly: OK" }]
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  const content = data.message?.content || "";
  if (!content.trim()) throw new Error("empty chat response");
  pass("cloud chat", `${model} => ${content.trim().slice(0, 60)}`);
}

async function testKnowledgeBase() {
  const dir = path.join(process.cwd(), "knowledge_base");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  if (files.length < 15) throw new Error(`expected >=15 md files, got ${files.length}`);
  pass("knowledge base files", `${files.length} markdown docs`);
}

async function main() {
  loadEnvLocal();
  console.log("=== ParkPal smoke tests ===");
  console.log(
    `RAG_MODE=${process.env.RAG_MODE} LLM=${process.env.LLM_PROVIDER} model=${process.env.OLLAMA_MODEL}`
  );

  try {
    await testKnowledgeBase();
  } catch (e) {
    fail("knowledge base files", e);
  }

  try {
    await testLocalEmbed();
  } catch (e) {
    fail("local nomic embeddings", e);
  }

  try {
    await testCloudChat();
  } catch (e) {
    fail("cloud chat", e);
  }

  if (process.exitCode) {
    console.log("\nInfra checks had failures; skipping in-process pipeline.");
    return;
  }

  const pipeline = spawnSync("npx", ["--yes", "tsx", "scripts/smoke-pipeline.ts"], {
    stdio: "inherit",
    env: process.env,
    shell: true
  });
  if (pipeline.status !== 0) {
    process.exitCode = 1;
    fail("pipeline via tsx", `exit ${pipeline.status}`);
  } else {
    pass("full pipeline runner", "exit 0");
  }

  if (!process.exitCode) {
    console.log("\n=== ALL CHECKS PASSED ===");
  } else {
    console.log("\n=== SOME CHECKS FAILED ===");
  }
}

main().catch((e) => {
  fail("smoke runner", e);
  process.exit(1);
});
