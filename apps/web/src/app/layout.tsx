import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter is the UI sans for the whole app (DESIGN.md). It maps to --font-sans,
// so shadcn's Base UI components inherit it.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Fraunces signs the wordmark only (The One Serif Rule). Soft optical axis for
// the warm-butler character.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "zico",
  description: "Personal agent system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
    >
      <body className="bg-canvas">
        {/* Set the theme class before paint to avoid a flash. Reads the cached
            choice; `system` (default) follows the OS. Durable copy lives in
            Supabase profiles.prefs.theme and is synced to localStorage on load. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: inline pre-paint theme script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zico:theme');var d=t==='dark'||((t!=='light')&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.add(d?'dark':'light')}catch(e){}})()`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
