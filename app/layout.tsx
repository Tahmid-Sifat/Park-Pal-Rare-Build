import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParkPal | Parking notice action agent",
  description: "Upload a parking notice, find deadlines, build evidence, and draft a calm appeal."
};

const themeScript = `
  try {
    const stored = localStorage.getItem("parkpal-theme");
    document.documentElement.dataset.theme = stored === "vivid" ? "vivid" : "warm";
  } catch (_) {
    document.documentElement.dataset.theme = "warm";
  }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="warm" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="relative isolate min-h-screen overflow-hidden">
          <div className="pointer-events-none fixed left-6 top-28 -z-10 hidden h-40 w-28 rotate-[-10deg] rounded-[2rem] border border-app bg-app-surface opacity-40 blur-[1px] lg:block" />
          <div className="pointer-events-none fixed bottom-24 right-8 -z-10 hidden h-48 w-32 rotate-12 rounded-[2rem] border border-app bg-app-surface opacity-30 blur-[1px] lg:block" />
          {children}
        </div>
      </body>
    </html>
  );
}
