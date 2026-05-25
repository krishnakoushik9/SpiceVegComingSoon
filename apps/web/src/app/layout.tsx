import type { Metadata, Viewport } from "next";
import {
  Anton,
  Inter,
  DM_Serif_Display,
  Playfair_Display,
  JetBrains_Mono,
  Patrick_Hand,
} from "next/font/google";
import "./globals.css";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const patrick = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spice Veg Agri Seeds — Rooted in Trust. Growing the Future.",
  description:
    "Premium vegetable seeds crafted with science, nurtured by nature, and trusted by thousands of farmers across India. Launching soon.",
  keywords: [
    "vegetable seeds",
    "premium seeds",
    "agriculture India",
    "SpiceVeg Agri",
    "horticulture",
    "organic farming",
    "seed certification",
    "hot pepper seeds",
  ],
  authors: [{ name: "SpiceVeg Agri Seeds Pvt Ltd" }],
  openGraph: {
    title: "Spice Veg Agri Seeds — Rooted in Trust. Growing the Future.",
    description:
      "Premium vegetable seeds crafted with science, nurtured by nature. Launching soon at spiceveg.in.",
    url: "https://spiceveg.in",
    siteName: "SpiceVeg Agri Seeds",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spice Veg Agri Seeds — Rooted in Trust. Growing the Future.",
    description:
      "Premium vegetable seeds crafted with science, nurtured by nature.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F7F5EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          anton.variable,
          inter.variable,
          dmSerif.variable,
          playfair.variable,
          jetbrains.variable,
          patrick.variable,
          "font-sans antialiased overflow-x-hidden bg-bg-primary text-ink"
        )}
      >
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
