import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: {
    default: "Mate Calculator — Are Your Dating Standards Realistic?",
    template: "%s | Mate Calculator",
  },
  description:
    "Find out what percentage of the US population actually meets your dating standards. Real Census + CDC data. No sugar-coating.",
  openGraph: {
    type: "website",
    siteName: "Mate Calculator",
    title: "Are Your Dating Standards Realistic?",
    description:
      "Real statistics on how many people in the US meet your standards — height, income, age, body type and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Are Your Dating Standards Realistic?",
    description:
      "Real statistics on how many people meet your standards. How selective are you really?",
  },
  keywords: [
    "dating standards calculator",
    "mate calculator",
    "realistic dating standards",
    "delusion calculator",
    "how many single people",
    "dating statistics",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        {/* Replace REPLACE_WITH_YOUR_PUBLISHER_ID with your actual AdSense publisher ID */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-REPLACE_WITH_YOUR_PUBLISHER_ID"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">{children}</body>
    </html>
  );
}
