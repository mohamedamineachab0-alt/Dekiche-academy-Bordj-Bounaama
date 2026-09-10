import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";
import "katex/dist/katex.min.css";

// Latin is variable; Arabic is static. Disable size-adjusted Arial fallbacks —
// they have no unicode-range and would paint Arabic before IBM Plex Sans Arabic.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["IBM Plex Sans Arabic", "sans-serif"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
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
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`h-full ${ibmPlexSans.variable} ${ibmPlexSansArabic.variable} ${ibmPlexSans.className} ${ibmPlexSansArabic.className}`}
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
