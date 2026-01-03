import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";
import { SessionProvider } from "@/lib/session";
import { CartProvider } from "@/lib/cart";

export const metadata = {
  title: "QR Order System",
  description: "Scan, Select, Order",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className=" min-h-screen">
        <ConvexClientProvider>
          <SessionProvider>
            <CartProvider>{children}</CartProvider>
          </SessionProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
