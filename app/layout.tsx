import type { Metadata } from "next";
import { EB_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClientRoot } from "./components/ClientRoot";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Certified Freaks Club",
  description: "A cinematic entry. Luxury, dark, minimal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-cfc-black text-cfc-off-white">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
