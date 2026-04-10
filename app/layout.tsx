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
  title: "AIRIS - Research & Innovation Society Portal",
  description: "Secure submission portal for AI Research & Innovation Society members.",
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
        <header className="py-12 px-16 absolute top-0 left-0 z-50">
          <div className="flex items-center">
            <div className="h-16 w-auto">
              <img src="/logo.png" alt="AIRIS Logo" className="h-full w-auto object-contain" />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
