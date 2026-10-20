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
          <title>503: DEPLOYMENT_PAUSED</title>
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
          <header className="w-full max-w-4xl px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="17"
                viewBox="0 0 76 65"
                fill="#ffffff"
                aria-label="Vercel logo"
              >
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
            </div>
          </header>

          {/* Center Card */}
          <main className="w-full max-w-[480px] mx-auto px-5 py-8 flex flex-col">
            <div className="rounded-xl border border-[#262626] bg-[#0a0a0a] p-7 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  503
                </span>
                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                  Edge Network
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                This Deployment is paused
              </h1>

              <p className="mt-2.5 text-sm text-neutral-400 leading-relaxed">
                This deployment has been paused by the owner or due to spend management and usage limits.
              </p>

              <div className="my-6 border-t border-[#222222]" />

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Code</span>
                  <span className="text-neutral-200">DEPLOYMENT_PAUSED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-neutral-200">503 Service Unavailable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Provider</span>
                  <span className="text-neutral-200">Vercel</span>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full max-w-4xl px-6 py-6 text-center text-xs font-mono text-neutral-600">
            <span>Vercel Edge Network</span>
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

