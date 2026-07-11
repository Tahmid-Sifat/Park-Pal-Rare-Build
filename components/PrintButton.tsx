"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-fern px-4 py-2 font-bold text-white" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      Print or save PDF
    </button>
  );
}
