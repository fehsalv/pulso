import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "PULSO — Connect with your energy",
  description: "Meet people who match your vibe. 18+ only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0A0A0F]">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}