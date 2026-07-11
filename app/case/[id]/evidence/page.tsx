import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { EvidenceWorkspace } from "@/components/EvidenceWorkspace";
import { getCase } from "@/lib/storage/caseStore";

export default async function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseFile = await getCase(id);
  if (!caseFile) notFound();
  return (
    <main className="page-shell">
      <AppNav />
      <div className="content-shell max-w-6xl space-y-5">
        <div className="premium-card p-6">
          <Link href={`/case/${caseFile.id}`} className="btn-ghost focus-ring px-0">Back to case</Link>
          <h1 className="mt-2 text-4xl font-black text-app">Evidence checklist</h1>
          <p className="mt-2 text-sm text-muted">Upload files, describe context, and improve the appeal strength before submitting.</p>
        </div>
        <EvidenceWorkspace initialCase={caseFile} />
      </div>
    </main>
  );
}
