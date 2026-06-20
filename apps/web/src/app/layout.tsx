import type { Metadata } from "next";
import { Navbar } from "@/components/global/Navbar";
import { Footer } from "@/components/global/Footer";
import { GridBackground } from "@/components/global/GridBackground";
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
            <main className="relative z-10 flex-1 pb-20 md:pb-0 pt-20">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
