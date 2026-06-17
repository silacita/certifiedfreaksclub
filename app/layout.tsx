import type { Metadata, Viewport } from "next";
import { EB_Garamond, Playfair_Display, Press_Start_2P, Space_Mono } from "next/font/google";
import "./globals.css";
import { ClientRoot } from "./components/ClientRoot";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

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

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "THE FREAKLAND",
    template: "%s — THE FREAKLAND",
  },
  description: "Incoming transmission. Certified Freaks Club.",
  openGraph: {
    title: "THE FREAKLAND",
    description: "is calling...",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${ebGaramond.variable} ${pressStart.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh w-full bg-black text-cfc-off-white">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
