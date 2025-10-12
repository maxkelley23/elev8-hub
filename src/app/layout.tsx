import type { Metadata } from "next";
import Navigation from "@/components/shared/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elev8 Hub",
  description: "Internal tools hub for Elev8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
