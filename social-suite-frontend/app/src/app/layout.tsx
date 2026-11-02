
import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Social Suite",
  description: "Social Suite Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
