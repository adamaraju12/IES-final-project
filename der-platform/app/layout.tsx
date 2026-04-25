import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DER Portfolio Platform — Santa Clara Hyperscale",
  description:
    "Behind-the-meter DER retrofit proposal and operations platform for a 48 MW hyperscale data center.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-navy text-white min-h-screen`}
      >
        <Nav />
        {/* pt accounts for fixed nav height: 56px top bar + 40px sub-nav */}
        <main className="pt-24 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
