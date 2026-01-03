"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { ShoppingBag, Plus, Minus, ArrowLeft, AlertCircle } from "lucide-react";
import { ChatAssistant } from "@/components/chat";

const categories = ["All", "Starters", "Mains", "Sides", "Drinks", "Desserts", "Hookah"];

export default function MenuPage() {
  const { tableId } = useParams();
  const router = useRouter();
  const { sessionId } = useSession();
  const [activeCategory, setActiveCategory] = useState("All");
  const { cart, addToCart, updateQuantity, clearCart, cartCount, cartTotal } = useCart();

  const table = useQuery(api.tables.getByNumber, { number: parseInt(tableId) });
  const menuItems = useQuery(api.menuItems.listForZone, table !== undefined ? { zoneId: table?.zoneId } : "skip");
  const activeOrder = useQuery(api.orders.getActiveBySession, sessionId ? { sessionId } : "skip");

  // Removed auto-redirect to my-orders - let users stay on menu page

  if (!menuItems) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[--primary] border-t-transparent rounded-full animate-spin"></div></div>;

  const filteredItems = activeCategory === "All" ? menuItems : menuItems.filter((item) => item.category === activeCategory);
  const getItemQuantity = (menuItemId) => cart.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  const handleAddToCart = (item) => addToCart({ menuItemId: item._id, name: item.name, price: item.price, image: item.image });

  return (
    <div className="min-h-screen pb-24">
      <div className="glass sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[--card] border border-[--border] hover:border-[--primary]/30 transition-all">
              <ArrowLeft size={18} className="text-[--muted]" />
            </button>
            <div className="text-center">
              <img src="/logo.png" alt="BTS DISC" className="h-10 rounded-full mx-auto mb-0.5" />
              <div className="flex items-center justify-center gap-1">
                <p className="text-xs text-[--muted]">Table {tableId}</p>
                {table?.zone && <><span className="text-xs text-[--border]">•</span><span className="text-xs text-[--primary]">{table.zone.name}</span></>}
                {table && !table.zone && <><span className="text-xs text-[--border]">•</span><span className="text-xs text-[--primary]">All Zones</span></>}
              </div>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
        <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 max-w-lg mx-auto">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat ? "btn-primary" : "bg-[--card] text-[--muted] border border-[--border] hover:border-[--primary]/30"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="space-y-3 stagger-children">
          {filteredItems.map((item) => {
            const qty = getItemQuantity(item._id);
            const isRestricted = !item.isAvailableInZone;
            return (
              <div key={item._id} className={`card rounded-xl p-4 ${isRestricted ? 'opacity-50' : ''}`}>
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-[--bg] rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border border-[--border]">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[--text-primary] text-sm mb-0.5">{item.name}</h3>
                    <p className="text-xs text-[--muted] line-clamp-1 mb-2">{item.description}</p>
                    {isRestricted && <div className="flex items-center gap-1 mb-2"><AlertCircle size={12} className="text-[--error]" /><span className="text-xs text-[--error]">{item.restrictionMessage}</span></div>}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[--primary]">${item.price.toFixed(2)}</span>
                      {isRestricted ? (
                        <span className="text-xs text-[--muted] px-3 py-1.5 bg-[--border] rounded-lg">Not Available</span>
                      ) : qty > 0 ? (
                        <div className="flex items-center gap-1 bg-[--bg] rounded-lg p-1 border border-[--border]">
                          <button onClick={() => updateQuantity(item._id, qty - 1)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[--border] transition-colors"><Minus size={14} className="text-[--muted]" /></button>
                          <span className="w-6 text-center text-sm font-semibold text-[--text-primary]">{qty}</span>
                          <button onClick={() => updateQuantity(item._id, qty + 1)} className="w-7 h-7 rounded-md bg-[--primary] flex items-center justify-center"><Plus size={14} className="text-black" /></button>
                        </div>
                      ) : (
                        <button onClick={() => handleAddToCart(item)} className="btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"><Plus size={14} />Add</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredItems.length === 0 && <div className="text-center py-12"><div className="text-4xl mb-3">🍽️</div><p className="text-[--muted] text-sm">No items in this category</p></div>}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-3 z-30 bg-gradient-to-t from-[--bg] to-transparent pt-8">
          <div className="max-w-lg mx-auto">
            <Link href={`/cart/${tableId}`} className="flex items-center justify-between btn-primary rounded-xl px-4 py-3 animate-scale-in">
              <div className="flex items-center gap-2"><ShoppingBag size={18} /><span className="font-semibold">{cartCount} items</span></div>
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
            </Link>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <ChatAssistant
        tableContext={table ? {
          tableId: tableId,
          tableNumber: table.number,
          zoneId: table.zoneId || null,
          zoneName: table.zone?.name || null,
        } : null}
        menuItems={menuItems}
        activeOrder={activeOrder}
        cart={cart}
        cartActions={{ addToCart, removeFromCart: (id) => updateQuantity(id, 0), clearCart }}
        sessionId={sessionId}
      />
    </div>
  );
}
