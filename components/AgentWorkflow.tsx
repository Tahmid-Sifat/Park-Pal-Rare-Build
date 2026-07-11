import { Bot, CheckCircle2, Clock, FileSearch, Gavel, ListChecks, Radar, ShieldAlert, Sparkles } from "lucide-react";
import { CaseFile } from "@/lib/types/caseTypes";

const agents = [
  ["Notice Reader", FileSearch, "Complete"],
  ["Classification", Radar, "Complete"],
  ["Deadline", Clock, "Complete"],
  ["RAG Knowledge", Sparkles, "Complete"],
  ["Evidence", ListChecks, "Needs input"],
  ["Appeal Drafting", Gavel, "Complete"],
  ["Risk Guard", ShieldAlert, "Complete"],
  ["Action", Bot, "Ready"]
] as const;

export function AgentWorkflow({ caseFile }: { caseFile: CaseFile }) {
  const missing = caseFile.evidenceItems.filter((item) => item.status === "missing").length;
  return (
    <section className="premium-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Agent activity</p>
          <h2 className="mt-2 text-2xl font-black text-app">Specialised agents worked through this case</h2>
        </div>
        <span className="status-pill normal-case tracking-normal">
          <span className="agent-dot" />
          {missing ? `${missing} evidence item${missing === 1 ? "" : "s"} missing` : "Appeal-ready"}
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map(([name, Icon, status]) => (
          <article key={name} className="micro-card p-4">
            <div className="flex items-center justify-between gap-3">
              <Icon className="h-5 w-5 text-primary" />
              <CheckCircle2 className="h-4 w-4" style={{ color: status === "Needs input" ? "var(--warning)" : "var(--success)" }} />
            </div>
            <h3 className="mt-4 font-black text-app">{name}</h3>
            <p className="mt-1 text-sm text-muted">{status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
