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
  title: "Anonymous Club - Grievance & Feedback Portal",
  description: "A private, frictionless channel for members to raise concerns safely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-[var(--surface)] border-b border-[var(--border)] py-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <span className="font-semibold text-lg text-[var(--text)]">Anonymous Club</span>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
