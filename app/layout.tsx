import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "منصة أكاديمية دقيش التعليمية برج بونعامة",
  description: "منصة وطنية للتعليم الجزائري - اصنع مستقبلك بثبات نحو القمة",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-full flex flex-col w-full max-w-full overflow-x-hidden overscroll-x-none touch-pan-y">
        {children}
      </body>
    </html>
  );
}
