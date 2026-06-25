import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agentready.davidcjw.com"),
  title: "AgentReady — AI Agent Readiness Scorer",
  description:
    "Score your GitHub repository's readiness for AI agent collaboration. Get an embeddable badge and detailed report.",
  openGraph: {
    type: "website",
    url: "https://agentready.davidcjw.com",
    siteName: "AgentReady",
    title: "AgentReady — AI Agent Readiness Scorer",
    description: "How ready is your repo for AI agent collaboration?",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentReady — AI Agent Readiness Scorer",
    description: "How ready is your repo for AI agent collaboration?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#080810] text-white">{children}</body>
    </html>
  );
}
