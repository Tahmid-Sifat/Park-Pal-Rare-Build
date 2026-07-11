import { appealPackHtml } from "@/lib/pdf/appealPackHtml";
import { appealPackPdf } from "@/lib/pdf/appealPackPdf";
import { getCase } from "@/lib/storage/caseStore";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const caseFile = await getCase(url.searchParams.get("caseId") || "");
  if (!caseFile) return new Response("Not found", { status: 404 });
  if (url.searchParams.get("format") === "pdf") {
    return new Response(appealPackPdf(caseFile), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="parkpal-appeal-pack-${caseFile.noticeFields.noticeReference}.pdf"`
      }
    });
  }
  return new Response(appealPackHtml(caseFile), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="parkpal-appeal-pack-${caseFile.noticeFields.noticeReference}.html"`
    }
  });
}
