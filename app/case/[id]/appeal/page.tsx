import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { AppealDraftEditor } from "@/components/AppealDraftEditor";
import { AppealGroundsPanel } from "@/components/AppealGroundsPanel";
import { RiskFlags } from "@/components/RiskFlags";
import { getCase } from "@/lib/storage/caseStore";

export default async function AppealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseFile = await getCase(id);
  if (!caseFile) notFound();
  return (
    <main className="page-shell">
      <AppNav />
      <div className="content-shell max-w-6xl space-y-5">
        <div className="premium-card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <Link href={`/case/${caseFile.id}`} className="btn-ghost focus-ring px-0">Back to dashboard</Link>
            <h1 className="mt-2 text-4xl font-black text-app">Draft appeal</h1>
            <p className="mt-2 text-sm text-muted">Review grounds, risk notes, and edit the appeal before export.</p>
          </div>
          <Link className="btn-primary focus-ring" href={`/case/${caseFile.id}/pack`}>Export pack</Link>
        </div>
        <RiskFlags flags={caseFile.riskFlags} />
        <AppealGroundsPanel caseFile={caseFile} />
        <AppealDraftEditor caseFile={caseFile} />
      </div>
    </main>
  );
}
