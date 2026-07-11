import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, FileScan, FileText, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { AppNav } from "./AppNav";
import { TrackBadges } from "./TrackBadges";
import { DisclaimerBanner } from "./DisclaimerBanner";

const workflow = [
  ["Notice scanned", "Issuer, vehicle, amount, location"],
  ["Deadline found", "Appeal and discount risk dates"],
  ["Evidence mapped", "2 missing items before appeal"],
  ["Draft ready", "Calm portal-ready challenge"]
];

export function LandingHero() {
  return (
    <main className="page-shell">
      <AppNav />
      <div className="content-shell space-y-10">
        <section className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8 animate-fadeInUp">
            <div className="space-y-4">
              <span className="hero-badge">
                <Sparkles className="h-4 w-4 text-primary" />
                Your AI parking notice action agent
              </span>
              <h1 className="max-w-4xl text-[clamp(2.4rem,7vw,5.8rem)] font-black leading-[0.95] tracking-tight text-app">
                Turn a parking notice into an action plan.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted md:text-xl">
                ParkPal reads your PCN or parking charge, finds the deadlines, checks possible appeal routes, builds your evidence checklist, and drafts a calm challenge letter.
              </p>
            </div>
            <TrackBadges />
            <div className="flex flex-wrap gap-3">
              <Link href="/upload" className="btn-primary focus-ring">
                <FileScan className="h-5 w-5" />
                Scan a notice
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/upload?demo=true" className="btn-secondary focus-ring">
                View demo case
              </Link>
            </div>
            <p className="max-w-2xl text-sm font-semibold leading-6 text-muted">
              ChatGPT can explain how to appeal. ParkPal helps you actually act correctly and on time.
            </p>
          </div>

          <div className="relative animate-fadeInUp lg:pl-6" style={{ animationDelay: "120ms" }}>
            <div className="absolute -inset-8 -z-10 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, var(--glow), transparent 62%)" }} />
            <div className="premium-card scan-line overflow-hidden p-5 animate-float">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">Live case preview</p>
                  <h2 className="mt-1 text-2xl font-black text-app">Private parking charge</h2>
                </div>
                <span className="status-pill normal-case tracking-normal">
                  <Radar className="h-4 w-4 text-primary" />
                  Agent active
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric icon={<CalendarClock className="h-5 w-5" />} label="Appeal deadline" value="28 days" />
                <Metric icon={<ShieldCheck className="h-5 w-5" />} label="Risk guard" value="Verify deadline" />
                <Metric icon={<FileText className="h-5 w-5" />} label="Appeal draft" value="Ready" />
                <Metric icon={<CheckCircle2 className="h-5 w-5" />} label="Evidence" value="2 missing" />
              </div>
              <div className="mt-5 space-y-3">
                {workflow.map(([title, detail], index) => (
                  <div key={title} className="micro-card flex items-center gap-3 p-4">
                    <span className="agent-dot" />
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-app">{title}</p>
                      <p className="text-sm text-muted">{detail}</p>
                    </div>
                    <span className="text-xs font-black text-primary">0{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <StoryCard title="Before ParkPal" items={["Confusing notice language", "Hidden time limits", "Messy evidence", "Panic-paying or ignoring it"]} tone="muted" />
          <div className="hidden items-center justify-center lg:flex">
            <ArrowRight className="h-8 w-8 text-primary" />
          </div>
          <StoryCard title="After ParkPal" items={["Classified notice route", "Clear deadline timeline", "Evidence checklist", "Draft and calendar reminder"]} tone="active" />
        </section>

        <section className="grid gap-5 pb-12 md:grid-cols-3">
          {[
            ["Specialised agents", "Reader, classifier, deadline, evidence, appeal, risk, and action agents work through the case."],
            ["Deadline-aware", "Calendar exports and reminder chips make time limits hard to miss."],
            ["Legally cautious", "Possible grounds are labelled carefully, with evidence and human-review warnings."]
          ].map(([title, text]) => (
            <article key={title} className="premium-card p-6">
              <h2 className="text-xl font-black text-app">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
            </article>
          ))}
        </section>
        <DisclaimerBanner />
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="soft-panel p-4">
      <div className="mb-3 text-primary">{icon}</div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-app">{value}</p>
    </div>
  );
}

function StoryCard({ title, items, tone }: { title: string; items: string[]; tone: "muted" | "active" }) {
  return (
    <article className="premium-card p-6">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{tone === "active" ? "Action plan" : "Stress state"}</p>
      <h2 className="mt-2 text-3xl font-black text-app">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm font-semibold text-muted">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-app text-primary">{tone === "active" ? "✓" : "!"}</span>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
