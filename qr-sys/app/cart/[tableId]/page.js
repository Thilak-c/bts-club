"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { Trash2, Plus, Minus, CreditCard, Banknote, UserRound, ArrowLeft, ShoppingBag, Clock } from "lucide-react";

const paymentOptions = [
  { id: "pay-now", label: "Pay Now", icon: CreditCard, description: "Pay online instantly" },
  { id: "pay-counter", label: "Pay at Counter", icon: Banknote, description: "Pay when you pick up" },
  { id: "pay-table", label: "Pay at Table", icon: UserRound, description: "Staff will come to you" },
];

export default function CartPage() {
  const { tableId } = useParams();
  const router = useRouter();
  const { sessionId } = useSession();
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const activeOrder = useQuery(api.orders.getActiveBySession, sessionId ? { sessionId } : "skip");
  const reservation = useQuery(api.reservations.getCurrentForTable, { tableNumber: parseInt(tableId) });
  const createOrder = useMutation(api.orders.create);

  useEffect(() => { if (activeOrder) router.replace(`/my-orders`); }, [activeOrder, router]);

  const handleOrder = async () => {
    if (cart.length === 0 || !paymentMethod || !sessionId) return;
    setIsOrdering(true);
    try {
      await createOrder({ tableId: tableId.toString(), items: cart.map((item) => ({ menuItemId: item.menuItemId, name: item.name, price: item.price, quantity: item.quantity, image: item.image })), total: cartTotal, paymentMethod, notes, customerSessionId: sessionId });
      clearCart();
      router.push(`/my-orders`);
    } catch (error) {
      console.error("Failed to place order:", error);
      setIsOrdering(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-[--card] border border-[--border] rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingBag size={32} className="text-[--primary]" /></div>
          <h1 className="font-luxury text-xl font-semibold text-[--text-primary] mb-2">Cart Empty</h1>
          <p className="text-[--muted] text-sm mb-6">Add items to get started</p>
          <Link href={`/menu/${tableId}`} className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm">Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36">
      <div className="glass sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href={`/menu/${tableId}`} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[--card] border border-[--border] hover:border-[--primary]/30 transition-all"><ArrowLeft size={18} className="text-[--muted]" /></Link>
            <div className="text-center"><h1 className="font-luxury text-lg font-semibold text-[--text-primary]">Your Cart</h1><p className="text-xs text-[--muted]">Table {tableId}</p></div>
            <div className="w-9"></div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Reservation Alert */}
        {reservation && (
          <div className={`rounded-xl p-3 border mb-4 ${reservation.isCurrent ? 'bg-amber-950/50 border-amber-700/50' : 'bg-blue-950/50 border-blue-700/50'}`}>
            <div className="flex items-center gap-2">
              <Clock size={16} className={reservation.isCurrent ? 'text-amber-400' : 'text-blue-400'} />
              <p className={`text-xs ${reservation.isCurrent ? 'text-amber-300' : 'text-blue-300'}`}>
                🪑 Table reserved {reservation.startTime} - {reservation.endTime}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 stagger-children mb-5">
          {cart.map((item) => (
            <div key={item.menuItemId} className="card rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[--bg] rounded-lg flex items-center justify-center text-xl flex-shrink-0 border border-[--border]">{item.image}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[--text-primary] text-sm">{item.name}</h3>
                  <p className="text-[--primary] text-sm font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[--bg] rounded-lg p-1 border border-[--border]">
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-[--border]"><Minus size={12} className="text-[--muted]" /></button>
                    <span className="w-5 text-center text-xs font-semibold text-[--text-primary]">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-[--border]"><Plus size={12} className="text-[--muted]" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.menuItemId)} className="w-8 h-8 rounded-lg bg-[--error]/10 border border-[--error]/20 text-[--error] flex items-center justify-center hover:bg-[--error]/20"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card rounded-xl p-4 mb-5">
          <label className="block text-xs tracking-widest text-[--muted] mb-2 uppercase">Special Instructions</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any allergies or requests?" className="w-full rounded-lg p-3 text-sm resize-none" rows={2} />
        </div>

        <div>
          <label className="block text-xs tracking-widest text-[--muted] mb-3 uppercase">Payment Method</label>
          <div className="space-y-2">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = paymentMethod === option.id;
              return (
                <button key={option.id} onClick={() => setPaymentMethod(option.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? "border-[--primary] bg-[--primary]/10" : "border-[--border] bg-[--card] hover:border-[--primary]/30"}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? "bg-[--primary] text-black" : "bg-[--bg] text-[--muted] border border-[--border]"}`}><Icon size={18} /></div>
                  <div className="text-left flex-1">
                    <p className={`text-sm font-medium ${isSelected ? "text-[--text-primary]" : "text-[--muted]"}`}>{option.label}</p>
                    <p className="text-xs text-[--muted]/60">{option.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[--primary] bg-[--primary]" : "border-[--border]"}`}>
                    {isSelected && <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass z-30">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[--muted] text-sm">Total</span>
            <span className="text-xl font-bold text-[--primary]">₹{cartTotal.toFixed(2)}</span>
          </div>
          <button onClick={handleOrder} disabled={isOrdering || !paymentMethod} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${isOrdering || !paymentMethod ? "bg-[--border] text-[--muted] cursor-not-allowed" : "btn-primary"}`}>
            {isOrdering ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>Processing...</span> : !paymentMethod ? "Select Payment" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
