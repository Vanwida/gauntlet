import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
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
  title: "Gauntlet — Your idea won't survive.",
  description: "5 AI judges. No mercy. No hand-holding. Just you, your idea, and the gauntlet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Gauntlet"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-bold text-lg tracking-tight">Gauntlet</span>
          </Link>
          <Link
            href="/play"
            className="text-sm bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-md font-medium"
          >
            Start Playing
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
