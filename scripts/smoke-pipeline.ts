import fs from "fs";
import path from "path";
import { ensureSystemCertificates } from "../lib/llm/systemCa";

ensureSystemCertificates();

// Load .env.local before importing app modules
const envPath = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq < 0) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

function pass(name: string, detail = "") {
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name: string, err: unknown) {
  console.error(`FAIL  ${name} — ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}

async function main() {
  const { retrieveSources } = await import("../lib/rag/retrieve");
  const { buildRagQuery, buildRejectionRagQuery } = await import("../lib/rag/queryBuilder");
  const { analyzeNotice } = await import("../lib/agents/orchestrator");
  const { analyzeRejectionText } = await import("../lib/agents/rejectionAnalyzerAgent");
  const { getRagConfig } = await import("../lib/rag/config");

  const config = getRagConfig();
  pass(
    "rag config",
    `mode=${config.mode} embedHost=${config.ollamaEmbedBaseUrl} embedModel=${config.ollamaEmbeddingModel}`
  );

  if (config.mode !== "ollama") {
    fail("rag config", `expected RAG_MODE=ollama, got ${config.mode}`);
  }

  const noticeText = fs.readFileSync(path.join(process.cwd(), "data/demoNotice.txt"), "utf8");
  const rejectionText = fs.readFileSync(path.join(process.cwd(), "data/demoRejection.txt"), "utf8");

  try {
    const query = buildRejectionRagQuery(rejectionText, "private_parking_charge");
    const result = await retrieveSources(query, 5);
    if (!result.sources.length) throw new Error("no sources returned");
    if (result.modeUsed !== "ollama") {
      throw new Error(`expected modeUsed=ollama, got ${result.modeUsed} (embed fallback?)`);
    }
    pass(
      "RAG retrieve (rejection query)",
      `${result.modeUsed}: ${result.sources.map((s) => `${s.document}(${s.score})`).join(", ")}`
    );
  } catch (e) {
    fail("RAG retrieve (rejection query)", e);
  }

  try {
    const caseFile = await analyzeNotice(noticeText, { demoEvidence: true });
    if (!caseFile.id) throw new Error("missing case id");
    if (!caseFile.retrievedSources?.length) throw new Error("no retrievedSources on case");
    if (!caseFile.appealGrounds?.length) throw new Error("no appeal grounds");
    if (!caseFile.draftFull) throw new Error("missing draft");
    pass(
      "notice analysis pipeline",
      `case=${caseFile.id.slice(0, 8)} type=${caseFile.noticeType} sources=${caseFile.retrievedSources.length} grounds=${caseFile.appealGrounds.length}`
    );

    try {
      const rejection = await analyzeRejectionText(rejectionText, caseFile);
      if (!rejection.escalationRoute) throw new Error("missing escalation route");
      if (!rejection.escalationDraft?.trim()) throw new Error("missing escalation draft");
      if (!rejection.retrievedSources?.length) throw new Error("rejection RAG returned no sources");
      if (rejection.ragModeUsed !== "ollama") {
        throw new Error(`expected rejection ragModeUsed=ollama, got ${rejection.ragModeUsed}`);
      }
      pass(
        "rejection analysis + RAG + chat draft",
        `mode=${rejection.ragModeUsed} sources=${rejection.retrievedSources.length} route=${rejection.escalationRoute.slice(0, 80)}`
      );
      console.log(`\nDraft preview:\n${rejection.escalationDraft.slice(0, 280)}\n`);
    } catch (e) {
      fail("rejection analysis + RAG + chat draft", e);
    }
  } catch (e) {
    fail("notice analysis pipeline", e);
  }

  // unused import guard
  void buildRagQuery;
}

main().catch((e) => {
  fail("pipeline runner", e);
  process.exit(1);
});
