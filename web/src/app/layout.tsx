import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Super-Learning | AI-Powered Note Generator",
  description: "Transform YouTube videos into comprehensive study notes with AI",
  keywords: ["AI", "learning", "notes", "YouTube", "study", "education"],
  openGraph: {
    title: "Super-Learning",
    description: "AI-Powered Learning Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
