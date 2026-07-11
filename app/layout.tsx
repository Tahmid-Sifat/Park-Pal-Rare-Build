import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParkPal | Scan. Understand. Act.",
  description: "Scan your parking notice. ParkPal verifies it and helps complete the correct next action."
};

const themeScript = `
  try {
    const stored = localStorage.getItem("parkpal-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = stored === "dark" || stored === "light" ? stored : systemDark ? "dark" : "light";
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="relative isolate min-h-screen overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
