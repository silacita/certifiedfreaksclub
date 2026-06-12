import type { Metadata } from "next";
import { EB_Garamond, Playfair_Display, Press_Start_2P } from "next/font/google";
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

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "THE FREAK HOTEL",
  description: "A forgotten game from 2002. You were expected.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${ebGaramond.variable} ${pressStart.variable} h-full overflow-hidden`}
    >
      <body className="h-dvh w-full overflow-hidden bg-black">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
