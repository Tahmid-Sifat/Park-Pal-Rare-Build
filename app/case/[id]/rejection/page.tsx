import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { RejectionAnalyzer } from "@/components/RejectionAnalyzer";
import { getCase } from "@/lib/storage/caseStore";

export default async function RejectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseFile = await getCase(id);
  if (!caseFile) notFound();
  return (
    <main className="page-shell">
      <AppNav />
      <div className="content-shell max-w-5xl space-y-5">
        <div className="premium-card p-6">
          <Link href={`/case/${caseFile.id}`} className="btn-ghost focus-ring px-0">Back to dashboard</Link>
          <h1 className="mt-2 text-4xl font-black text-app">Rejection analyzer</h1>
          <p className="mt-2 text-sm text-muted">Check the next route and deadline after an operator or council rejection.</p>
        </div>
        <RejectionAnalyzer caseId={caseFile.id} />
      </div>
    </main>
  );
}
