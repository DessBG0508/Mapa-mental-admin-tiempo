import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mapa mental · Administración del tiempo en Scrum · Equilibra TESH",
  description:
    "Mapa mental interactivo con explicación por voz sobre la administración del tiempo en Scrum, usando como caso de estudio el proyecto Equilibra TESH.",
  keywords: [
    "Scrum",
    "timeboxing",
    "administración del tiempo",
    "Equilibra TESH",
    "mapa mental",
    "voz",
  ],
  authors: [{ name: "Equilibra TESH · TESH" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
