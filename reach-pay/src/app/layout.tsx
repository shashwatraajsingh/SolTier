import type { Metadata } from "next";
import { Patrick_Hand, Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/context/WalletContextProvider";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "react-hot-toast";

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SolTier | Performance-Based Payouts on Solana",
  description: "Get paid for your reach. Automatically settled on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${patrickHand.variable} ${inter.variable} antialiased`}>
        <WalletContextProvider>
          <UserProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  border: '2px solid black',
                  borderRadius: '0px',
                  fontFamily: 'var(--font-patrick)',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                },
              }}
            />
          </UserProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
