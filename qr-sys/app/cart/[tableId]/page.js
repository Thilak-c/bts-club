"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { useTable } from "@/lib/table";
import { 
  Trash2, Plus, Minus, CreditCard, Banknote, 
  UserRound, ArrowLeft, ShoppingBag, Clock, Ticket
} from "lucide-react";
import MenuItemImage from "@/components/MenuItemImage";

// Format 24h time to 12h format
const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return minutes === 0 ? `${hour12} ${period}` : `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const paymentOptions = [
  { id: "pay-now", label: "Pay Now", icon: CreditCard, description: "Pay online instantly" },
  { id: "pay-counter", label: "Pay at Counter", icon: Banknote, description: "Pay when you pick up" },
  { id: "pay-table", label: "Pay at Table", icon: UserRound, description: "Staff will come to you" },
];

export default function CartPage() {
  const { tableId } = useParams();
  const router = useRouter();
  const { sessionId } = useSession();
  const { setTable } = useTable();
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const activeOrder = useQuery(api.orders.getActiveBySession, sessionId ? { sessionId } : "skip");
  const reservation = useQuery(api.reservations.getCurrentForTable, { tableNumber: parseInt(tableId) });
  const createOrder = useMutation(api.orders.create);

  // Get customer deposit balance from localStorage phone
  const customerPhone = typeof window !== 'undefined' ? localStorage.getItem('customerPhone') : null;
  const customer = useQuery(api.customers.getByPhone, customerPhone ? { phone: customerPhone } : "skip");
  const depositBalance = customer?.depositBalance || 0;
  
  // Calculate final total after deposit
  const depositToUse = Math.min(depositBalance, cartTotal);
  const finalTotal = cartTotal - depositToUse;

  // Set table context
  useEffect(() => {
    if (tableId) {
      setTable({
        tableId: String(tableId),
        tableNumber: parseInt(tableId),
        zoneName: null,
      });
    }
  }, [tableId]);

  useEffect(() => { 
    if (activeOrder) router.replace(`/my-orders`); 
  }, [activeOrder, router]);

  const handleOrder = async () => {
    if (cart.length === 0 || !paymentMethod || !sessionId) return;
    setIsOrdering(true);
    try {
      await createOrder({ 
        tableId: tableId.toString(), 
        items: cart.map((item) => ({ 
          menuItemId: item.menuItemId, 
          name: item.name, 
          price: item.price, 
          quantity: item.quantity, 
          image: item.image 
        })), 
        total: cartTotal, 
        paymentMethod, 
        notes, 
        customerSessionId: sessionId 
      });
      clearCart();
      router.push(`/my-orders`);
    } catch (error) {
      console.error("Failed to place order:", error);
      setIsOrdering(false);
    }
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 bg-[--card] border border-[--border] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-[--primary]" />
          </div>
          <h1 className="font-luxury text-2xl font-semibold text-[--text-primary] mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-[--text-muted] text-sm mb-8">
            Add some delicious items to get started
          </p>
          <Link 
            href={`/menu/${tableId}`} 
            className="inline-flex items-center gap-2 btn-primary px-8 py-4 rounded-xl text-sm font-semibold"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40">
      {/* Header */}
      <header className="glass sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href={`/menu/${tableId}`} 
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-[--card] border border-[--border] hover:border-[--border-light] transition-all"
            >
              <ArrowLeft size={18} className="text-[--text-muted]" />
            </Link>
            <div className="text-center">
              <h1 className="font-luxury text-lg font-semibold text-[--text-primary]">Your Cart</h1>
              <p className="text-xs text-[--text-muted]">Table {tableId}</p>
            </div>
            <div className="w-11" />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Reservation Alert */}
        {reservation && (
          <div className={`rounded-xl p-4 border mb-6 ${
            reservation.isCurrent 
              ? 'bg-amber-500/5 border-amber-500/20' 
              : 'bg-blue-500/5 border-blue-500/20'
          }`}>
            <div className="flex items-center gap-3">
              <Clock size={18} className={reservation.isCurrent ? 'text-amber-400' : 'text-blue-400'} />
              <p className={`text-sm ${reservation.isCurrent ? 'text-amber-300' : 'text-blue-300'}`}>
                Table reserved {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
              </p>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-3 stagger-children mb-8">
          {cart.map((item) => (
            <div key={item.menuItemId} className="card rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[--bg-elevated] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-[--border]">
                  <MenuItemImage storageId={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[--text-primary] text-sm mb-1">{item.name}</h3>
                  <p className="price-tag">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-[--bg-elevated] rounded-lg p-1 border border-[--border]">
                    <button 
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} 
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[--card] transition-colors"
                    >
                      <Minus size={14} className="text-[--text-muted]" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-[--text-primary]">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} 
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[--card] transition-colors"
                    >
                      <Plus size={14} className="text-[--text-muted]" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.menuItemId)} 
                    className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        <div className="card rounded-xl p-5 mb-8">
          <label className="block text-[10px] tracking-[0.2em] text-[--text-muted] mb-3 uppercase">
            Special Instructions
          </label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Any allergies or special requests?" 
            className="w-full rounded-xl p-4 text-sm resize-none !bg-[--bg-elevated]" 
            rows={2} 
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] text-[--text-muted] mb-4 uppercase">
            Payment Method
          </label>
          <div className="space-y-3">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = paymentMethod === option.id;
              return (
                <button 
                  key={option.id} 
                  onClick={() => setPaymentMethod(option.id)} 
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isSelected 
                      ? "border-[--primary] bg-[--primary]/5" 
                      : "border-[--border] bg-[--card] hover:border-[--border-light]"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected 
                      ? "bg-[--primary] text-[--bg]" 
                      : "bg-[--bg-elevated] text-[--text-muted] border border-[--border]"
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-medium ${isSelected ? "text-[--text-primary]" : "text-[--text-muted]"}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-[--text-dim]">{option.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? "border-[--primary] bg-[--primary]" 
                      : "border-[--border]"
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-[--bg]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass z-30">
        <div className="max-w-lg mx-auto px-5 py-5">
          {/* Deposit discount */}
          {depositToUse > 0 && (
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[--border]">
              <div className="flex items-center gap-2">
                <Ticket size={16} className="text-emerald-400" />
                <span className="text-emerald-400 text-sm">Reservation Credit</span>
              </div>
              <span className="text-emerald-400 font-semibold">-₹{depositToUse.toFixed(0)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[--text-muted] text-sm">Total Amount</span>
              {depositToUse > 0 && (
                <p className="text-[--text-dim] text-xs line-through">₹{cartTotal.toFixed(0)}</p>
              )}
            </div>
            <span className="text-2xl font-luxury font-semibold text-gradient">
              ₹{finalTotal.toFixed(0)}
            </span>
          </div>
          <button 
            onClick={handleOrder} 
            disabled={isOrdering || !paymentMethod} 
            className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
              isOrdering || !paymentMethod 
                ? "bg-[--border] text-[--text-dim] cursor-not-allowed" 
                : "btn-primary"
            }`}
          >
            {isOrdering ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 spinner rounded-full" />
                Processing...
              </span>
            ) : !paymentMethod ? (
              "Select Payment Method"
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
