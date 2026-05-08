import type { Metadata } from "next";
import { Anton, Inter, DM_Serif_Display, Reenie_Beanie } from "next/font/google";
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
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
});

const reenie = Reenie_Beanie({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-reenie",
});

export const metadata: Metadata = {
  title: "SpiceVeg Agri Seeds | Coming Soon",
  description: "Advancing Horticultural Science. Cultivating excellence in every field.",
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
          reenie.variable,
          "font-sans antialiased overflow-x-hidden"
        )}
      >
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
