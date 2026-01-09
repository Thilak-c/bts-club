"use client";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";
import { SessionProvider } from "@/lib/session";
import { CartProvider } from "@/lib/cart";
import { TableProvider, useTable } from "@/lib/table";
import { Bodoni_Moda, Manrope } from "next/font/google";
import CallStaffButton from "@/components/CallStaffButton";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bodoni",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
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
    <html lang="en" className={`${bodoni.variable} ${manrope.variable}`}>
      <head>
        <title>BTS DISC - Premium Lounge</title>
        <meta name="description" content="Scan, Select, Order - Premium dining experience" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body className="font-sans antialiased">
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
