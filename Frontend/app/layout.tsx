"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import NavigationHeader from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { Suspense } from "react";
import ShopHistoryListener from "@/components/ShopHistoryListener";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // Specify all weights you want to use
  subsets: ["latin"],
  variable: "--font-poppins", // This is the new CSS variable name
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes("admin");

  return (
    <html lang="en">
      <head>
        
      </head>
      <body className={`${poppins.variable} ${geistSans.variable} antialiased`}>
        {!isAdminRoute && (
          <Suspense>
            <NavigationHeader />
          </Suspense>
        )}
        <Suspense fallback={null}>
          <ShopHistoryListener />
        </Suspense>
        
          <main className="min-h-screen">{children}</main>
        
        <Toaster position="top-center" />
        {!isAdminRoute && <Footer />}

        
      </body>
    </html>
  );
}
