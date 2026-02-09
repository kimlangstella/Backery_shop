import "./globals.css"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sweetify Cake Shop",
  description: "A demo e-commerce cake shop optimized for Core Web Vitals & SEO.",
  metadataBase: new URL("https://example.com"),
  openGraph: { title: "Sweetify Cake Shop", type: "website", siteName: "Sweetify" },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
};

import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <Toaster position="top-center" reverseOrder={false} />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
