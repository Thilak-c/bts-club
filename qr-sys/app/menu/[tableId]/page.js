"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { ShoppingBag, Plus, Minus, ArrowLeft, AlertCircle, Armchair, UtensilsCrossed, Search, X, ChevronRight, Ban } from "lucide-react";
import { ChatAssistant } from "@/components/chat";

const categories = [
  { id: "All", icon: "◉" },
  { id: "Starters", icon: "◈" },
  { id: "Mains", icon: "◆" },
  { id: "Sides", icon: "◇" },
  { id: "Drinks", icon: "○" },
  { id: "Desserts", icon: "●" },
  { id: "Hookah", icon: "◎" },
];

export default function MenuPage() {
  const { tableId } = useParams();
  const router = useRouter();
  const { sessionId } = useSession();
  const [activeCategory, setActiveCategory] = useState("All");
  const [dismissedReservation, setDismissedReservation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [unavailablePopup, setUnavailablePopup] = useState(null);
  const { cart, addToCart, updateQuantity, clearCart, cartCount, cartTotal } = useCart();

  const table = useQuery(api.tables.getByNumber, { number: parseInt(tableId) });
  const menuItems = useQuery(api.menuItems.listForZone, table !== undefined ? { zoneId: table?.zoneId } : "skip");
  const activeOrder = useQuery(api.orders.getActiveBySession, sessionId ? { sessionId } : "skip");
  const reservation = useQuery(api.reservations.getCurrentForTable, { tableNumber: parseInt(tableId) });

  // Full screen reservation alert
  if (reservation && !dismissedReservation) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <div className="p-4 flex items-center justify-between opacity-0 animate-slide-down" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="BTS DISC" className="h-8 rounded-full" />
            <span className="text-zinc-600 text-xs font-mono">BTS DISC</span>
          </div>
          <span className="text-zinc-700 text-xs font-mono flex items-center gap-1"><Armchair size={14} /> TABLE {tableId}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 opacity-0 animate-bounce-in ${reservation.isCurrent ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`} style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
            <span className="animate-pulse-soft">{reservation.isCurrent ? '●' : '○'}</span> {reservation.isCurrent ? 'Currently Reserved' : 'Upcoming'}
          </div>
          <div className="text-center mb-8">
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-3 opacity-0 animate-fade-in" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>Reserved</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-white font-mono opacity-0 animate-slide-in-left" style={{animationDelay: '0.5s', animationFillMode: 'forwards'}}>{reservation.startTime}</span>
              <span className="text-zinc-600 opacity-0 animate-scale-in" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>→</span>
              <span className="text-4xl font-bold text-white font-mono opacity-0 animate-slide-in-right" style={{animationDelay: '0.5s', animationFillMode: 'forwards'}}>{reservation.endTime}</span>
            </div>
          </div>
          <div className="w-16 h-px bg-zinc-800 mb-8 opacity-0 animate-expand" style={{animationDelay: '0.7s', animationFillMode: 'forwards'}}></div>
          {reservation.customerName && (
            <div className="text-center mb-2 opacity-0 animate-slide-up" style={{animationDelay: '0.8s', animationFillMode: 'forwards'}}>
              <p className="text-white text-lg">{reservation.customerName}</p>
              {reservation.partySize && <p className="text-zinc-600 text-sm">{reservation.partySize} guests</p>}
            </div>
          )}
        </div>
        <div className="p-6 space-y-3">
          <Link href="/book" className="block w-full bg-white text-black py-4 rounded-xl font-semibold text-sm text-center opacity-0 animate-slide-up hover:bg-zinc-200 transition-colors" style={{animationDelay: '0.9s', animationFillMode: 'forwards'}}>Book a Table</Link>
          <Link href="/" className="block w-full bg-zinc-900 text-zinc-400 py-4 rounded-xl font-semibold text-sm text-center border border-zinc-800 opacity-0 animate-slide-up hover:bg-zinc-800 hover:text-white transition-all" style={{animationDelay: '1s', animationFillMode: 'forwards'}}>Go to Other Table</Link>
        </div>
      </div>
    );
  }

  if (!menuItems) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[--primary] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-600 text-sm">Loading menu...</p>
      </div>
    </div>
  );

  // Filter items
  let filteredItems = activeCategory === "All" ? menuItems : menuItems.filter((item) => item.category === activeCategory);
  if (searchQuery) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const getItemQuantity = (menuItemId) => cart.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  const handleAddToCart = (item) => addToCart({ menuItemId: item._id, name: item.name, price: item.price, image: item.image });

  // Group items by category for "All" view
  const groupedItems = activeCategory === "All" 
    ? categories.slice(1).map(cat => ({
        ...cat,
        items: filteredItems.filter(item => item.category === cat.id)
      })).filter(cat => cat.items.length > 0)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-lg mx-auto">
          {/* Top row */}
          <div className="px-4 py-3 flex items-center justify-between">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 transition-all active:scale-95">
              <ArrowLeft size={18} className="text-zinc-400" />
            </button>
            
            <div className="text-center flex-1 px-4">
              <p className="text-white font-semibold">Table {tableId}</p>
              {table?.zone && <p className="text-[10px] text-[--primary] uppercase tracking-wider">{table.zone.name}</p>}
            </div>
            
            <button 
              onClick={() => setShowSearch(!showSearch)} 
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${showSearch ? 'bg-[--primary] text-black' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              {showSearch ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="px-4 pb-3 animate-slide-down" style={{animationFillMode: 'forwards'}}>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu..."
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-[--primary] focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                    activeCategory === cat.id 
                      ? "bg-white text-black" 
                      : "bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <span className="opacity-60">{cat.icon}</span>
                  {cat.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {searchQuery && (
          <p className="text-zinc-600 text-xs mb-4">{filteredItems.length} results for "{searchQuery}"</p>
        )}

        {/* Grouped view for "All" */}
        {groupedItems ? (
          <div className="space-y-3">
            {groupedItems.map((group, groupIndex) => (
              <div key={group.id} className="opacity-0 animate-slide-up" style={{animationDelay: `${groupIndex * 0.1}s`, animationFillMode: 'forwards'}}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <span className="text-[--primary]">{group.icon}</span>
                    {group.id}
                  </h2>
                  <span className="text-zinc-600 text-xs">{group.items.length} items</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {group.items.map((item) => (
                    <MenuItem 
                      key={item._id} 
                      item={item} 
                      qty={getItemQuantity(item._id)}
                      onAdd={() => handleAddToCart(item)}
                      onUpdate={(newQty) => updateQuantity(item._id, newQty)}
                      onUnavailable={() => setUnavailablePopup(item)}
                      zoneName={table?.zone?.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single category view */
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {filteredItems.map((item) => (
              <MenuItem 
                key={item._id} 
                item={item} 
                qty={getItemQuantity(item._id)}
                onAdd={() => handleAddToCart(item)}
                onUpdate={(newQty) => updateQuantity(item._id, newQty)}
                onUnavailable={() => setUnavailablePopup(item)}
                zoneName={table?.zone?.name}
              />
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <UtensilsCrossed size={48} className="mx-auto mb-4 text-zinc-800" />
            <p className="text-zinc-600 text-sm">No items found</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-[--primary] text-sm mt-2 hover:underline">
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="max-w-lg mx-auto px-4 pb-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 flex items-center gap-2 animate-slide-up" style={{animationFillMode: 'forwards'}}>
              <Link 
                href={`/cart/${tableId}`} 
                className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center relative">
                  <ShoppingBag size={16} className="text-zinc-400" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[--primary] rounded-full text-[10px] font-bold text-black flex items-center justify-center">{cartCount}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">₹{cartTotal.toFixed(0)}</p>
                  <p className="text-zinc-500 text-[10px]">View cart</p>
                </div>
              </Link>
              <Link 
                href={`/cart/${tableId}`}
                className="bg-[--primary] text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-[--primary-hover] active:scale-[0.98] transition-all"
              >
                Order
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <ChatAssistant
        tableContext={table ? { tableId, tableNumber: table.number, zoneId: table.zoneId || null, zoneName: table.zone?.name || null } : null}
        menuItems={menuItems}
        activeOrder={activeOrder}
        cart={cart}
        cartActions={{ addToCart, removeFromCart: (id) => updateQuantity(id, 0), clearCart }}
        sessionId={sessionId}
      />

      {/* Unavailable Item Popup */}
      {unavailablePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setUnavailablePopup(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div 
            className="relative bg-zinc-900  p-6 max-w-xs w-full animate-scale-in text-center"
            onClick={(e) => e.stopPropagation()}
            style={{animationFillMode: 'forwards'}}
          >
            {/* Icon */}
            {/* <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ban size={32} className="text-red-500" />
            </div> */}
            
            {/* Title */}
            <h3 className="text-white font-bold text-lg mb-2">Not Available In The Zone</h3>
            
            {/* Item name */}
            <p className="text-[--primary] font-medium mb-1">{unavailablePopup.name}</p>
            
            {/* Message */}
            <p className="text-zinc-500 text-sm mb-6">
              This item isn't available in <span className="text-zinc-300">{table?.zone?.name || 'this zone'}</span>
            </p>
            
            {/* Button */}
            <button 
              onClick={() => setUnavailablePopup(null)}
              className="w-full py-3.5 bg-zinc-800 text-white rounded-xl font-semibold hover:bg-zinc-700 active:scale-[0.98] transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Menu Item Component
function MenuItem({ item, qty, onAdd, onUpdate, onUnavailable, zoneName }) {
  const isRestricted = !item.isAvailableInZone;
  
  const handleClick = () => {
    if (isRestricted) {
      onUnavailable();
      return;
    }
    if (qty === 0) {
      onAdd();
    } else {
      onUpdate(qty + 1);
    }
  };
  
  return (
    <div 
      onClick={handleClick}
      className={`bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 transition-all hover:border-zinc-700 active:scale-[0.98] cursor-pointer `}
    >
      {/* Image */}
      <div className="aspect-square bg-zinc-800 flex items-center justify-center text-5xl relative">
        {item.image}
        {qty > 0 && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-[--primary] rounded-full flex items-center justify-center text-xs font-bold text-black animate-scale-in">
            {qty}
          </div>
        )}
        {isRestricted && (
          <div className="absolute inset-0 bg-black/0 flex items-center justify-center">
            {/* <Ban size={32} className="text-white/60" /> */}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-white text-sm mb-0.5 line-clamp-1">{item.name}</h3>
        <p className="text-[10px] text-zinc-500 line-clamp-1 mb-2">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-[--primary] font-bold">₹{item.price.toFixed(0)}</span>
          
          {isRestricted ? (
            <span className="text-[10px] text-red-400">Not in {zoneName || 'zone'}</span>
          ) : qty > 0 ? (
            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => onUpdate(qty - 1)} 
                className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-colors active:scale-90"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center text-sm font-semibold text-white">{qty}</span>
              <button 
                onClick={() => onUpdate(qty + 1)} 
                className="w-7 h-7 flex items-center justify-center text-[--primary] hover:bg-[--primary] hover:text-black rounded-r-lg transition-all active:scale-90"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-500">Tap to add</span>
          )}
        </div>
      </div>
    </div>
  );
}
