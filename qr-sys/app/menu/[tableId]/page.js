"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCart } from "@/lib/cart";
import { useTable } from "@/lib/table";
import { 
  ShoppingBag, Plus, Minus, ArrowLeft, Armchair, 
  UtensilsCrossed, Search, X, Phone, Lock
} from "lucide-react";
import MenuItemImage from "@/components/MenuItemImage";
import { isRestaurantOpen } from "@/components/ClosedPopup";

// Format 24h time to 12h format
const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return minutes === 0 ? `${hour12} ${period}` : `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

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
  const { setTable } = useTable();
  const [activeCategory, setActiveCategory] = useState("All");
  const [dismissedReservation, setDismissedReservation] = useState(false);
  const [dismissedClosed, setDismissedClosed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [unavailablePopup, setUnavailablePopup] = useState(null);
  const { cart, addToCart, updateQuantity, cartCount, cartTotal } = useCart();
  
  // Reservation verification states
  const [verifyStep, setVerifyStep] = useState('ask'); // 'ask' | 'phone' | 'verified' | 'denied'
  const [phoneInput, setPhoneInput] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const table = useQuery(api.tables.getByNumber, { number: parseInt(tableId) });
  const menuItems = useQuery(api.menuItems.listForZone, table !== undefined ? { zoneId: table?.zoneId } : "skip");
  const reservation = useQuery(api.reservations.getCurrentForTable, { tableNumber: parseInt(tableId) });

  // Check if already verified for this table in session
  useEffect(() => {
    const verified = sessionStorage.getItem(`table-${tableId}-verified`);
    if (verified) {
      setVerifyStep('verified');
      setDismissedReservation(true);
    }
  }, [tableId]);

  // Set table context for call staff button
  useEffect(() => {
    if (tableId) {
      setTable({
        tableId: String(tableId),
        tableNumber: parseInt(tableId),
        zoneName: table?.zone?.name || null,
      });
    }
  }, [tableId, table?.zone?.name]);

  // Check if dismissed closed popup in session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('closed-popup-dismissed');
    if (wasDismissed) setDismissedClosed(true);
  }, []);

  // Full screen closed alert (before reservation check)
  if (!isRestaurantOpen() && !dismissedClosed) {
    const handleDismissClosed = () => {
      setDismissedClosed(true);
      sessionStorage.setItem('closed-popup-dismissed', 'true');
    };
    
    const now = new Date();
    const hour = now.getHours();
    const OPEN_HOUR = 12;
    let hoursUntilOpen = hour < OPEN_HOUR ? OPEN_HOUR - hour : (24 - hour) + OPEN_HOUR;

    return (
      <div className="min-h-screen flex flex-col">
        <div className="p-5 flex items-center justify-between opacity-0 animate-slide-down" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="BTS DISC" className="h-9 w-9 rounded-full object-contain" />
            <span className="text-[--text-dim] text-xs tracking-[0.15em] uppercase">BTS DISC</span>
          </div>
          <span className="text-[--text-dim] text-xs flex items-center gap-2">
            <Armchair size={14} /> 
            <span className="tracking-wider">TABLE {tableId}</span>
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24">
          <div 
            className="px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] mb-10 opacity-0 animate-bounce-in bg-amber-500/10 text-amber-400 border border-amber-500/20"
            style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse-soft" />
            Currently Closed
          </div>
          <div className="text-center mb-10">
            <p className="text-[--text-dim] text-[10px] uppercase tracking-[0.3em] mb-4 opacity-0 animate-fade-in" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
              Business Hours
            </p>
            <div className="flex items-center gap-5">
              <span className="text-5xl font-luxury font-semibold text-[--text-primary] opacity-0 animate-slide-in-left" style={{animationDelay: '0.5s', animationFillMode: 'forwards'}}>
                12 PM
              </span>
              <span className="text-[--text-dim] text-2xl opacity-0 animate-scale-in" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
                →
              </span>
              <span className="text-5xl font-luxury font-semibold text-[--text-primary] opacity-0 animate-slide-in-right" style={{animationDelay: '0.5s', animationFillMode: 'forwards'}}>
                11 PM
              </span>
            </div>
          </div>
          <div className="divider-glow w-24 mb-10 opacity-0 animate-expand" style={{animationDelay: '0.7s', animationFillMode: 'forwards'}} />
          <div className="text-center opacity-0 animate-slide-up" style={{animationDelay: '0.8s', animationFillMode: 'forwards'}}>
            <p className="text-[--text-primary] text-xl font-luxury">Opens in ~{hoursUntilOpen}h</p>
            <p className="text-[--text-muted] text-sm mt-1">Open daily</p>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <button 
            onClick={handleDismissClosed}
            className="btn-primary w-full py-4 rounded-xl text-sm font-medium opacity-0 animate-slide-up"
            style={{animationDelay: '0.9s', animationFillMode: 'forwards'}}
          >
            Browse Menu Anyway
          </button>
          <Link 
            href="/book"
            className="block w-full py-3 text-center text-[--text-muted] text-sm hover:text-[--text-primary] transition-colors opacity-0 animate-slide-up"
            style={{animationDelay: '1s', animationFillMode: 'forwards'}}
          >
            Book for Future
          </Link>
        </div>
      </div>
    );
  }

  // Full screen reservation alert with verification
  if (reservation && !dismissedReservation) {
    // Handle phone verification
    const handleVerifyPhone = () => {
      const cleanPhone = phoneInput.replace(/\D/g, '');
      const reservationPhone = reservation.customerPhone?.replace(/\D/g, '') || '';
      
      if (cleanPhone === reservationPhone || cleanPhone.endsWith(reservationPhone) || reservationPhone.endsWith(cleanPhone)) {
        // Phone matches - allow access
        setVerifyStep('verified');
        setDismissedReservation(true);
        sessionStorage.setItem(`table-${tableId}-verified`, 'true');
        // Store customer info
        localStorage.setItem('customerPhone', reservation.customerPhone);
        localStorage.setItem('customerName', reservation.customerName);
      } else {
        setVerifyError('Phone number doesn\'t match the reservation');
      }
    };

    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-5 flex items-center justify-between opacity-0 animate-slide-down" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="BTS DISC" className="h-9 w-9 rounded-full object-contain" />
            <span className="text-[--text-dim] text-xs tracking-[0.15em] uppercase">BTS DISC</span>
          </div>
          <span className="text-[--text-dim] text-xs flex items-center gap-2">
            <Armchair size={14} /> 
            <span className="tracking-wider">TABLE {tableId}</span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24">
          {/* Status Badge */}
          <div 
            className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] mb-8 opacity-0 animate-bounce-in ${
              reservation.isCurrent 
                ? 'bg-[--primary]/10 text-[--primary] border border-[--primary]/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`} 
            style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse-soft" />
            {reservation.isCurrent ? 'Reserved Table' : 'Upcoming Reservation'}
          </div>

          {/* Step 1: Ask if they are the person */}
          {verifyStep === 'ask' && (
            <>
              <div className="text-center mb-8 opacity-0 animate-slide-up" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
                <p className="text-[--text-dim] text-[10px] uppercase tracking-[0.3em] mb-3">Are you</p>
                <p className="text-4xl font-luxury font-semibold text-[--text-primary]">{reservation.customerName}?</p>
                {reservation.partySize && (
                  <p className="text-[--text-muted] text-sm mt-2">{reservation.partySize} guests • {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</p>
                )}
              </div>

              <div className="divider-glow w-24 mb-8 opacity-0 animate-expand" style={{animationDelay: '0.5s', animationFillMode: 'forwards'}} />

              <div className="w-full max-w-xs space-y-3 opacity-0 animate-slide-up" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
                <button 
                  onClick={() => setVerifyStep('phone')}
                  className="btn-primary w-full py-4 rounded-xl text-sm font-semibold"
                >
                  Yes, that's me
                </button>
                <button 
                  onClick={() => setVerifyStep('denied')}
                  className="btn-secondary w-full py-4 rounded-xl text-sm font-semibold"
                >
                  No, I'm someone else
                </button>
              </div>
            </>
          )}

          {/* Step 2: Phone verification */}
          {verifyStep === 'phone' && (
            <>
              <div className="text-center mb-8 opacity-0 animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
                <div className="w-16 h-16 rounded-full bg-[--primary]/10 border border-[--primary]/20 flex items-center justify-center mx-auto mb-4">
                  <Phone size={24} className="text-[--primary]" />
                </div>
                <p className="text-[--text-primary] text-lg font-luxury mb-2">Verify your phone</p>
                <p className="text-[--text-muted] text-sm">Enter the phone number used for booking</p>
              </div>

              <div className="w-full max-w-xs space-y-4 opacity-0 animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
                <div>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => { setPhoneInput(e.target.value); setVerifyError(''); }}
                    placeholder="Phone number"
                    className="w-full bg-[--card] border border-[--border] rounded-xl px-4 py-4 text-center text-lg tracking-wider"
                    autoFocus
                  />
                  {verifyError && (
                    <p className="text-red-400 text-xs text-center mt-2">{verifyError}</p>
                  )}
                </div>
                <button 
                  onClick={handleVerifyPhone}
                  disabled={!phoneInput}
                  className="btn-primary w-full py-4 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  Verify & Continue
                </button>
                <button 
                  onClick={() => setVerifyStep('ask')}
                  className="w-full py-3 text-[--text-muted] text-sm"
                >
                  Go back
                </button>
              </div>
            </>
          )}

          {/* Step 3: Access denied */}
          {verifyStep === 'denied' && (
            <>
              <div className="text-center mb-8 opacity-0 animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} className="text-red-400" />
                </div>
                <p className="text-[--text-primary] text-lg font-luxury mb-2">Table Reserved</p>
                <p className="text-[--text-muted] text-sm">This table is booked by {reservation.customerName}</p>
                <p className="text-[--text-dim] text-xs mt-1">{formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</p>
              </div>

              <div className="w-full max-w-xs space-y-3 opacity-0 animate-slide-up" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
                <Link href="/book" className="btn-primary w-full py-4 rounded-xl text-sm font-semibold block text-center">
                  Book Your Own Table
                </Link>
                <Link href="/" className="btn-secondary w-full py-4 rounded-xl text-sm font-semibold block text-center">
                  Go Home
                </Link>
                <button 
                  onClick={() => setVerifyStep('ask')}
                  className="w-full py-3 text-[--text-muted] text-sm"
                >
                  Wait, I am {reservation.customerName}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (!menuItems) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 spinner rounded-full mx-auto mb-4" />
          <p className="text-[--text-muted] text-sm">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Filter items
  let filteredItems = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter((item) => item.category === activeCategory);
  
  if (searchQuery) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const getItemQuantity = (menuItemId) => cart.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  const handleAddToCart = (item) => addToCart({ 
    menuItemId: item._id, 
    name: item.name, 
    price: item.price, 
    image: item.image 
  });

  // Group items by category for "All" view
  const groupedItems = activeCategory === "All" 
    ? categories.slice(1).map(cat => ({
        ...cat,
        items: filteredItems.filter(item => item.category === cat.id)
      })).filter(cat => cat.items.length > 0)
    : null;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass">
        <div className="max-w-lg mx-auto">
          {/* Top row */}
          <div className="px-3 py-2 flex items-center justify-between">
            <button 
              onClick={() => router.back()} 
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[--card] border border-[--border] active:scale-95"
            >
              <ArrowLeft size={14} className="text-[--text-muted]" />
            </button>
            
            <div className="text-center flex-1 px-2">
              <p className="text-[--text-primary] font-semibold text-xs">Table {tableId}</p>
              {table?.zone && (
                <p className="text-[8px] text-[--primary] uppercase tracking-wider">
                  {table.zone.name}
                </p>
              )}
            </div>
            
            <button 
              onClick={() => setShowSearch(!showSearch)} 
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
                showSearch 
                  ? 'bg-[--primary] text-[--bg]' 
                  : 'bg-[--card] border border-[--border] text-[--text-muted]'
              }`}
            >
              {showSearch ? <X size={14} /> : <Search size={14} />}
            </button>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="px-3 pb-2 animate-slide-down" style={{animationFillMode: 'forwards'}}>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--text-dim]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search menu..."
                  autoFocus
                  className="w-full !bg-[--card] rounded-lg pl-8 pr-3 py-2 text-[11px] placeholder:text-[--text-dim]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[--text-dim]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="px-3 pb-2 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`px-2.5 py-1.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all active:scale-95 ${
                    activeCategory === cat.id 
                      ? "pill-active" 
                      : "bg-[--card] border border-[--border] text-[--text-muted]"
                  }`}
                >
                  {cat.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <div className="max-w-lg mx-auto px-2 py-3">
        {searchQuery && (
          <p className="text-[--text-dim] text-[9px] mb-3 px-1">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}

        {/* Grouped view for "All" */}
        {groupedItems ? (
          <div className="space-y-8">
            {groupedItems.map((group, groupIndex) => (
              <div 
                key={group.id} 
                className="opacity-0 animate-slide-up" 
                style={{animationDelay: `${groupIndex * 0.1}s`, animationFillMode: 'forwards'}}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[--text-primary] font-luxury text-sm flex items-center gap-1.5">
                    <span className="text-[--primary] text-xs">{group.icon}</span>
                    {group.id}
                  </h2>
                  <span className="text-[--text-dim] text-[9px]">{group.items.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 menu-card-grid">
                  {group.items.map((item) => (
                    <MenuItem 
                      key={item._id} 
                      item={item} 
                      qty={getItemQuantity(item._id)}
                      onAdd={() => handleAddToCart(item)}
                      onUpdate={(newQty) => updateQuantity(item._id, newQty)}
                      onUnavailable={() => setUnavailablePopup(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single category view */
          <div className="grid grid-cols-2 gap-2 stagger-children menu-card-grid">
            {filteredItems.map((item) => (
              <MenuItem 
                key={item._id} 
                item={item} 
                qty={getItemQuantity(item._id)}
                onAdd={() => handleAddToCart(item)}
                onUpdate={(newQty) => updateQuantity(item._id, newQty)}
                onUnavailable={() => setUnavailablePopup(item)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-14 h-14 rounded-xl bg-[--card] border border-[--border] flex items-center justify-center mx-auto mb-3">
              <UtensilsCrossed size={24} className="text-[--text-dim]" />
            </div>
            <p className="text-[--text-muted] text-xs mb-2">No items found</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="text-[--primary] text-xs"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 pb-4">
          <div className="max-w-lg mx-auto">
            <Link 
              href={`/cart/${tableId}`}
              className="flex items-center justify-between card rounded-xl px-4 py-3 animate-slide-up group"
              style={{animationFillMode: 'forwards'}}
            >
              {/* Left side - count & total */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[--primary]/10 border border-[--primary]/20 flex items-center justify-center">
                  <span className="text-[--primary] font-luxury text-sm font-semibold">{cartCount}</span>
                </div>
                <div>
                  <p className="text-[--text-primary] text-xs font-medium">View Cart</p>
                  <p className="text-[--text-dim] text-[10px]">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              {/* Right side - total & arrow */}
              <div className="flex items-center gap-2">
                <span className="price-tag text-base">₹{cartTotal.toFixed(0)}</span>
                <div className="w-7 h-7 rounded-md bg-[--primary] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ShoppingBag size={12} className="text-[--bg]" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Unavailable Item Popup */}
      {unavailablePopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          onClick={() => setUnavailablePopup(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div 
            className="relative card rounded-xl p-5 max-w-[260px] w-full animate-scale-in text-center"
            onClick={(e) => e.stopPropagation()}
            style={{animationFillMode: 'forwards'}}
          >
            <h3 className="text-[--text-primary] font-luxury text-base mb-2">
              Not Available
            </h3>
            <p className="text-[--primary] font-medium text-sm mb-1">{unavailablePopup.name}</p>
            <p className="text-[--text-muted] text-xs mb-5">
              Not available in {table?.zone?.name || 'this zone'}
            </p>
            <button 
              onClick={() => setUnavailablePopup(null)}
              className="w-full btn-secondary py-2.5 rounded-lg text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Menu Item Component
function MenuItem({ item, qty, onAdd, onUpdate, onUnavailable }) {
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
      className={`card rounded-lg overflow-hidden cursor-pointer group menu-card-item ${
        isRestricted ? 'opacity-60' : ''
      }`}
    >
      {/* Image - smaller aspect ratio */}
      <div className="menu-image aspect-[5/4] flex items-center justify-center relative overflow-hidden">
        <MenuItemImage storageId={item.image} alt={item.name} className="w-full h-full object-cover" />
        {qty > 0 && (
          <div className="absolute top-1.5 right-1.5 qty-badge w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-[--bg] animate-scale-in">
            {qty}
          </div>
        )}
      </div>
      
      {/* Info - compact */}
      <div className="p-2">
        <h3 className="font-medium text-[--text-primary] text-[11px] mb-0.5 line-clamp-1 group-hover:text-[--primary] transition-colors">
          {item.name}
        </h3>
        <p className="text-[8px] text-[--text-dim] line-clamp-1 mb-1.5">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="price-tag text-xs">₹{item.price.toFixed(0)}</span>
          
          {isRestricted ? (
            <span className="text-[8px] text-red-400/80">Not here</span>
          ) : qty > 0 ? (
            <div 
              className="flex items-center bg-[--bg-elevated] rounded border border-[--border] qty-controls" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => onUpdate(qty - 1)} 
                className="w-5 h-5 flex items-center justify-center text-[--text-muted] active:scale-90"
              >
                <Minus size={10} />
              </button>
              <span className="w-3 text-center text-[10px] font-semibold text-[--text-primary]">
                {qty}
              </span>
              <button 
                onClick={() => onUpdate(qty + 1)} 
                className="w-5 h-5 flex items-center justify-center text-[--primary] active:scale-90"
              >
                <Plus size={10} />
              </button>
            </div>
          ) : (
            <span className="text-[8px] text-[--text-dim]">+ Add</span>
          )}
        </div>
      </div>
    </div>
  );
}
