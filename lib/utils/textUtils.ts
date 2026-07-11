export function extractFirst(patterns: RegExp[], text: string) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

export function toIsoDate(input: string) {
  const clean = input.trim();
  const dmy = clean.match(/(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2,4})/);
  if (dmy) {
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  const parsed = new Date(clean);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return clean;
}

export function moneyToNumber(input: string) {
  const match = input.replace(",", "").match(/(\d+(?:\.\d{1,2})?)/);
  return match ? Number(match[1]) : null;
}
