import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentWorkflow } from "@/components/AgentWorkflow";
import { AppealGroundsPanel } from "@/components/AppealGroundsPanel";
import { AppNav } from "@/components/AppNav";
import { CaseHero } from "@/components/CaseHero";
import { CaseActionPlan } from "@/components/CaseActionPlan";
import { CaseTimeline } from "@/components/CaseTimeline";
import { ConfirmationPanel } from "@/components/ConfirmationPanel";
import { DeadlineCards } from "@/components/DeadlineCards";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { EvidenceChecklist } from "@/components/EvidenceChecklist";
import { NoticeSummaryCard } from "@/components/NoticeSummaryCard";
import { RiskFlags } from "@/components/RiskFlags";
import { getCase } from "@/lib/storage/caseStore";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseFile = await getCase(id);
  if (!caseFile) notFound();

  return (
    <main className="page-shell">
      <AppNav />
      <div className="content-shell space-y-6">
        <CaseHero caseFile={caseFile} />
        <CaseActionPlan caseFile={caseFile} />
        <AgentWorkflow caseFile={caseFile} />
        <NoticeSummaryCard caseFile={caseFile} />
        <ConfirmationPanel caseFile={caseFile} />
        <DeadlineCards caseFile={caseFile} />
        <RiskFlags flags={caseFile.riskFlags} />
        <AppealGroundsPanel caseFile={caseFile} />
        <EvidenceChecklist caseFile={caseFile} />
        <CaseTimeline caseFile={caseFile} />
        <section className="premium-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Source transparency</p>
              <h2 className="mt-2 text-2xl font-black text-app">Knowledge snippets retrieved</h2>
            </div>
            <Link href={`/case/${caseFile.id}/evidence`} className="btn-secondary focus-ring">Add evidence</Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {caseFile.retrievedSources.map((source) => (
              <div key={source.document} className="micro-card p-5">
                <p className="font-black text-app">{source.document}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{source.snippet}</p>
              </div>
            ))}
          </div>
        </section>
        <DisclaimerBanner />
      </div>
    </main>
  );
}
