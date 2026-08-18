import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Background } from "@/components/background";
import { Opening } from "@/components/opening";
import { FloatingChrome } from "@/components/theme-toggle";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.title,
    type: "website",
  },
  icons: { icon: "/api/avatar", apple: "/api/avatar" },
};

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  // The default palette; the picker changes the page, not the browser chrome.
  themeColor: "#0e0f14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider>
          <Background />
          <Opening>
            {children}
            <FloatingChrome />
          </Opening>
        </ThemeProvider>
      </body>
    </html>
  );
}
