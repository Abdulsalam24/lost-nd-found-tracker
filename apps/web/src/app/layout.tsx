import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GridBackground } from "@/components/GridBackground";
import { AuthProvider } from "@/lib/AuthProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniLorin Lost & Found",
  description: "Campus Lost & Found Item Tracker for University of Ilorin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <AuthProvider>
            <GridBackground />
            <Navbar />
            <main className="relative z-10 flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
