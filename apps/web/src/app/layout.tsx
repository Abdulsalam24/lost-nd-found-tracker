import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/lib/AuthProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UniLorin Lost & Found",
  description: "Campus Lost & Found Item Tracker for University of Ilorin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sora.variable}>
      <body className="font-sans flex min-h-screen flex-col">
        <div className="grid-bg" aria-hidden="true" />
        <div className="grid-bg-coarse" aria-hidden="true" />
        <div className="grid-vignette" aria-hidden="true" />
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="relative z-10 flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
