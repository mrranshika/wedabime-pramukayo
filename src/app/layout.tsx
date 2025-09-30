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
  title: "Zip Cart Co Web Solutions - Professional Development",
  description: "Modern Next.js scaffold optimized for professional web development with Zip Cart Co Web Solutions. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Zip Cart Co Web Solutions", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "professional development", "React"],
  authors: [{ name: "Zip Cart Co Web Solutions Team" }],
  openGraph: {
    title: "Zip Cart Co Web Solutions",
    description: "Professional web development with modern React stack",
    url: "https://www.zipcartco.site",
    siteName: "Zip Cart Co Web Solutions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zip Cart Co Web Solutions",
    description: "Professional web development with modern React stack",
  },
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
