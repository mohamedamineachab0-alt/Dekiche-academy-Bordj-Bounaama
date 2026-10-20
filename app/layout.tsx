import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";

// Latin is variable; Arabic is static. Disable size-adjusted Arial fallbacks —
// they have no unicode-range and would paint Arabic before IBM Plex Sans Arabic.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["IBM Plex Sans Arabic", "sans-serif"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["sans-serif"],
  variable: "--font-ibm-plex-sans-arabic",
});

export const metadata: Metadata = {
  title: "منصة أكاديمية دقيش التعليمية برج بونعامة",
  description: "منصة وطنية للتعليم الجزائري - اصنع مستقبلك بثبات نحو القمة",
  applicationName: "أكاديمية دقيش",
  appleWebApp: {
    capable: true,
    title: "أكاديمية دقيش",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#5b21b6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const IS_BLACKOUT = true;

  if (IS_BLACKOUT) {
    return (
      <html lang="en" className="h-full bg-black">
        <head>
          <title>402: PAYMENT_REQUIRED</title>
        </head>
        <body
          className="h-full w-full bg-black text-[#ededed] m-0 p-0 flex flex-col justify-between items-center min-h-screen select-none font-sans antialiased"
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
          suppressHydrationWarning
        >
          {/* Header */}
          <header className="w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between border-b border-[#1f1f1f]">
            <div className="flex items-center gap-3">
              <svg
                width="24"
                height="21"
                viewBox="0 0 76 65"
                fill="#ffffff"
                aria-label="Vercel logo"
              >
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              <span className="font-semibold text-sm tracking-tight text-white">Vercel</span>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-neutral-400 bg-neutral-900/80 border border-neutral-800 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              HTTP 402
            </span>
          </header>

          {/* Main Full Page Content (No square/box) */}
          <main className="w-full max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-400 mb-4">
                <span>Billing &amp; Subscriptions</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                Payment Required
              </h1>

              <p className="mt-5 text-base sm:text-lg text-neutral-400 leading-relaxed">
                Access to this deployment has been suspended due to an outstanding balance or unpaid subscription fees. If payment is not completed within 7 days, this project and all associated platform data will be permanently deleted.
              </p>

              <div className="mt-6 p-4 rounded-lg border border-rose-900/50 bg-rose-950/20 text-sm font-mono text-rose-300">
                <span className="font-semibold text-rose-400">Notice:</span> Permanent deletion scheduled in 7 days if balance remains unsettled.
              </div>

              <div className="my-8 border-t border-[#1f1f1f]" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-neutral-500">Error Code</span>
                  <span className="text-neutral-200">PAYMENT_REQUIRED</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-neutral-200">402 Payment Required</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-neutral-500">Reason</span>
                  <span className="text-rose-400">Overdue Balance / Unpaid Fees</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-neutral-500">Grace Period</span>
                  <span className="text-rose-400 font-semibold">7 days remaining</span>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full max-w-5xl mx-auto px-6 py-8 border-t border-[#1f1f1f] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-600">
            <span>Vercel Edge Network</span>
            <span>Platform Services Suspended</span>
          </footer>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`h-full ${ibmPlexSans.variable} ${ibmPlexSansArabic.variable} font-sans`}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased min-h-full flex flex-col w-full max-w-full overflow-x-hidden overscroll-x-none touch-pan-y bg-background text-ink selection:bg-primary selection:text-white relative"
        suppressHydrationWarning
      >
        <div className="relative z-10 w-full flex-1 flex flex-col">
          {children}
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}

