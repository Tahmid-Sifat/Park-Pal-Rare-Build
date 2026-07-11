import Link from "next/link";
import { ArrowRight, FileScan, ParkingCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  ["Scan", "/upload"],
  ["Deadlines", "/upload?demo=true"],
  ["Evidence", "/upload?demo=true"],
  ["Appeal", "/upload?demo=true"],
  ["Demo", "/upload?demo=true"]
];

export function AppNav() {
  return (
    <header className="sticky top-3 z-40 mx-auto mb-8 w-full max-w-7xl px-1 no-print">
      <nav className="premium-card flex flex-wrap items-center justify-between gap-3 rounded-full px-4 py-3">
        <Link href="/" className="focus-ring inline-flex items-center gap-3 rounded-full pr-2 font-black text-app">
          <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-2))", color: "white" }}>
            <ParkingCircle className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">ParkPal</span>
        </Link>
        <div className="hidden flex-wrap items-center gap-1 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={label} href={href} className="btn-ghost focus-ring text-sm">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/upload" className="btn-primary focus-ring hidden px-4 py-2 text-sm sm:inline-flex">
            <FileScan className="h-4 w-4" />
            Scan notice
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
