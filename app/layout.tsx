import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ArweaveWalletKit } from "arweave-wallet-kit";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AO Chatroom",
  description: "", // To be written
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ArweaveWalletKit>
          {children}
        </ArweaveWalletKit>
      </body>
    </html>
  );
}
