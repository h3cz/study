import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { CommandPalette } from "@/components/CommandPalette";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { GuestSaveSlotBar } from "@/components/GuestSaveSlotBar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://study.hecz.dev"),
  title: "hecz / study — free CompTIA exam trainer",
  description: "Free CompTIA Security+, Network+ & A+ practice — daily questions + spaced-repetition flashcards. Built by Hecz.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/h-mark.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "hecz study",
  },
  openGraph: {
    images: [{ url: "/brand/og-light.png", width: 2752, height: 1536 }],
  },
  twitter: {
    images: ["/brand/og-light.png"],
  },
};

export const viewport: Viewport = {
  // viewport-fit=cover is required for env(safe-area-inset-*) to resolve to
  // non-zero values inside the iPhone notch / home-indicator areas when the
  // app runs as an installed standalone PWA.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  // Theme color follows the active mode so the iOS status bar / Android chrome
  // matches the page background in both light and dark.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D0E" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <InAppBrowserBanner />
          <NavBar />
          <GuestSaveSlotBar />
          <CommandPalette />
          <main className="max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 lg:py-8 main-content-pb">{children}</main>
          <MobileBottomNav />
          <InstallPrompt />
          <footer
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "24px",
              paddingBottom: "24px",
            }}
          >
            <div
              style={{
                maxWidth: "896px",
                margin: "0 auto",
                padding: "0 16px",
                textAlign: "center",
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                color: "var(--fg-muted)",
              }}
            >
              made by hecz ·{" "}
              <a
                href="https://hecz.dev"
                style={{ color: "var(--fg-muted)", textDecoration: "underline" }}
              >
                hecz.dev
              </a>
              {" "}·{" "}
              <a
                href="/credits"
                style={{ color: "var(--fg-muted)", textDecoration: "underline" }}
              >
                Credits &amp; sources
              </a>
            </div>
          </footer>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
