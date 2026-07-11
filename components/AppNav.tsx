"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FileScan, Menu, ParkingCircle, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  ["Scan", "/upload"],
  ["Deadlines", "/upload?demo=true"],
  ["Evidence", "/upload?demo=true"],
  ["Appeal", "/upload?demo=true"],
  ["Demo", "/upload?demo=true"]
];

export function AppNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-3 z-40 mx-auto mb-6 w-full max-w-7xl px-1 no-print sm:mb-8">
      <nav className="premium-card flex flex-wrap items-center justify-between gap-3 rounded-full px-3 py-2.5 sm:px-4 sm:py-3">
        <Link href="/" className="focus-ring inline-flex min-w-0 items-center gap-2 rounded-full pr-2 font-black text-app sm:gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full sm:h-10 sm:w-10" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-2))", color: "white" }}>
            <ParkingCircle className="h-5 w-5" />
          </span>
          <span className="truncate text-base tracking-tight sm:text-lg">ParkPal</span>
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
          <Link href="/upload" className="btn-primary focus-ring px-3 py-2 text-sm sm:px-4">
            <FileScan className="h-4 w-4" />
            <span className="sm:hidden">Scan</span>
            <span className="hidden sm:inline">Scan notice</span>
            <ArrowRight className="hidden h-4 w-4 md:block" />
          </Link>
          <button
            type="button"
            className="btn-secondary focus-ring px-3 py-2 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-nav" className="premium-card mt-2 grid gap-1 p-3 lg:hidden">
          {nav.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="btn-ghost focus-ring justify-start px-4 py-3 text-left"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
