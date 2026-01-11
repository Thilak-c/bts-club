"use client";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";
import { SessionProvider } from "@/lib/session";
import { CartProvider } from "@/lib/cart";
import { TableProvider, useTable } from "@/lib/table";
import { Bodoni_Moda, Roboto_Slab } from "next/font/google";
import CallStaffButton from "@/components/CallStaffButton";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bodoni",
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400"],
  variable: "--font-slab",
  display: "swap",
});

function LayoutContent({ children }) {
  const { tableInfo } = useTable();
  
  return (
    <>
      <main className="relative z-10">
        {children}
      </main>
      {tableInfo && (
        <CallStaffButton 
          tableId={tableInfo.tableId} 
          tableNumber={tableInfo.tableNumber}
          zoneName={tableInfo.zoneName}
        />
      )}
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${robotoSlab.variable}`}>
      <head>
        <title>BTS DISC - CAFE & RESTAURANT</title>
        <meta name="description" content="Scan, Select, Order - dining experience" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={`${robotoSlab.className} antialiased font-light`}>
        {/* Ambient background glow */}
        <div className="ambient-glow fixed inset-0" aria-hidden="true" />
        
        <ConvexClientProvider>
          <SessionProvider>
            <CartProvider>
              <TableProvider>
                <LayoutContent>{children}</LayoutContent>
              </TableProvider>
            </CartProvider>
          </SessionProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
