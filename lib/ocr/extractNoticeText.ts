export type ExtractedNoticeText = {
  text: string;
  confidence: number;
  method: "text" | "pdf-basic" | "image-placeholder" | "unsupported";
  warnings: string[];
};

export async function extractNoticeText(file: File, pastedText = ""): Promise<ExtractedNoticeText> {
  const fallbackText = pastedText.trim();
  if (file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt")) {
    return {
      text: (await file.text()).trim() || fallbackText,
      confidence: 0.9,
      method: "text",
      warnings: []
    };
  }

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const text = await extractBasicPdfText(file);
    return {
      text: text || fallbackText || `Uploaded PDF: ${file.name}. OCR text was not readable in this MVP, so pasted text is required for reliable extraction.`,
      confidence: text ? 0.5 : 0.2,
      method: "pdf-basic",
      warnings: text ? ["Basic PDF text extraction used. Verify all fields."] : ["PDF uploaded, but embedded text was not readable. Paste the notice text for reliable extraction."]
    };
  }

  if (file.type.startsWith("image/")) {
    return {
      text: fallbackText || `Uploaded image: ${file.name}. Image OCR is represented as an MVP placeholder; paste the notice text for reliable extraction.`,
      confidence: 0.18,
      method: "image-placeholder",
      warnings: ["Image OCR is not fully implemented in the MVP. Paste text or use the demo path."]
    };
  }

  return {
    text: fallbackText,
    confidence: fallbackText ? 0.4 : 0.1,
    method: "unsupported",
    warnings: [`Unsupported notice file type: ${file.type || "unknown"}.`]
  };
}

async function extractBasicPdfText(file: File) {
  const raw = Buffer.from(await file.arrayBuffer()).toString("latin1");
  const matches = Array.from(raw.matchAll(/\(([^()]{3,})\)\s*Tj/g)).map((match) => match[1]);
  return matches
    .map((item) => item.replace(/\\([()\\])/g, "$1").replace(/\\n/g, " "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
