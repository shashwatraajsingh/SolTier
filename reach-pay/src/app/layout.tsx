import type { Metadata } from "next";
import { Patrick_Hand, Inter } from "next/font/google";
import "./globals.css";

const patrickHand = Patrick_Hand({
  weight: "400",
  variable: "--font-patrick",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReachPay - Get paid for your reach",
  description: "Performance-based payouts for X promotions. Views + likes. On-chain. No guesswork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${patrickHand.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
