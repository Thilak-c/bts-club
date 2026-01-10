"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/session";
import { useCart } from "@/lib/cart";
import { useTable } from "@/lib/table";
import { 
  Trash2, Plus, Minus, CreditCard, Banknote, 
  UserRound, ArrowLeft, ShoppingBag, 
  ChevronRight, Ticket, MessageSquare, X, Check
} from "lucide-react";
import MenuItemImage from "@/components/MenuItemImage";

const paymentOptions = [
  { id: "pay-now", label: "Pay Now", icon: CreditCard, desc: "Online payment" },
  { id: "pay-counter", label: "At Counter", icon: Banknote, desc: "Pay when ready" },
  { id: "pay-table", label: "At Table", icon: UserRound, desc: "Staff comes to you" },
];

export default function CartPage() {
  const { tableId } = useParams();
  const router = useRouter();
  const { sessionId } = useSession();
  const { setTable } = useTable();
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart, cartCount } = useCart();
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  
  // Phone number for order
  const [orderPhone, setOrderPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  // Coupon code (phone number) state
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponPhone, setCouponPhone] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const activeOrder = useQuery(api.orders.getActiveBySession, sessionId ? { sessionId } : "skip");
  const createOrder = useMutation(api.orders.create);

  // Get customer deposit balance - from localStorage, coupon input, or order phone
  const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('customerPhone') : null;
  const phoneToCheck = couponApplied ? `+91${couponPhone}` : (orderPhone.length === 10 ? `+91${orderPhone}` : storedPhone);
  const customer = useQuery(api.customers.getByPhone, phoneToCheck ? { phone: phoneToCheck } : "skip");
  const depositBalance = customer?.depositBalance || 0;
  
  // Load stored phone on mount
  useEffect(() => {
    if (storedPhone) {
      setOrderPhone(storedPhone.replace('+91', ''));
    }
  }, [storedPhone]);
  
  const depositToUse = depositBalance > 0 ? Math.min(depositBalance, cartTotal) : 0;
  const finalTotal = cartTotal - depositToUse;

  // Check if user already has credit from localStorage
  const hasStoredCredit = storedPhone && depositBalance > 0;

  const handleApplyCoupon = () => {
    if (couponPhone.length !== 10) {
      setCouponError("Enter 10 digit number");
      return;
    }
    setCouponApplied(true);
    setCouponError("");
    setShowCouponInput(false);
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponPhone("");
  };

  useEffect(() => {
    if (tableId) {
      setTable({ tableId: String(tableId), tableNumber: parseInt(tableId), zoneName: null });
    }
  }, [tableId]);

  // Removed auto-redirect to /my-orders when activeOrder exists

  const handleOrder = async () => {
    console.log("handleOrder called", { cartLength: cart.length, paymentMethod, sessionId });
    
    // Validate phone number
    if (orderPhone.length !== 10) {
      setPhoneError("Enter 10 digit phone number");
      return;
    }
    
    if (cart.length === 0 || !paymentMethod || !sessionId) {
      console.log("Early return - missing data");
      return;
    }
    
    const customerPhone = `+91${orderPhone}`;
    // Store phone in localStorage
    localStorage.setItem('customerPhone', customerPhone);
    
    // Use the phone that has the deposit (could be from coupon or order phone)
    const phoneForDeposit = depositToUse > 0 ? phoneToCheck : customerPhone;
    
    console.log("Order details - depositToUse:", depositToUse, "phoneForDeposit:", phoneForDeposit, "phoneToCheck:", phoneToCheck);
    
    // If pay now, open Razorpay
    if (paymentMethod === 'pay-now') {
      console.log("Payment method is pay-now, opening Razorpay");
      setIsOrdering(true);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_yourkeyhere",
        amount: Math.round(finalTotal * 100), // Amount in paise
        currency: "INR",
        name: "BTS DISC",
        description: `Order - Table ${tableId}`,
        image: "https://bts-club-one.vercel.app/logo.png",
        handler: async function (response) {
          // Payment successful - create order
          console.log("Razorpay payment success, creating order...", response);
          try {
            const orderResult = await createOrder({ 
              tableId: tableId.toString(), 
              items: cart.map((item) => ({ 
                menuItemId: item.menuItemId, 
                name: item.name, 
                price: item.price, 
                quantity: item.quantity, 
                image: item.image 
              })), 
              total: finalTotal, 
              paymentMethod: 'pay-now', 
              notes: notes || `Payment: ${response.razorpay_payment_id}`, 
              customerSessionId: sessionId,
              customerPhone: phoneForDeposit,
              depositUsed: depositToUse || 0
            });
            console.log("Order created:", orderResult);
            clearCart();
            // Show success, play sound
            console.log("Order created successfully, showing success screen");
            setShowOrderSuccess(true);
            // Play success sound
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 800;
              gain.gain.value = 0.3;
              osc.start();
              osc.frequency.setValueAtTime(800, ctx.currentTime);
              osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
              osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
              gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
              osc.stop(ctx.currentTime + 0.5);
            } catch(e) {}
          } catch (error) {
            console.error("Failed to place order:", error);
            alert("Order failed: " + error.message);
            setIsOrdering(false);
          }
        },
        prefill: {
          contact: phoneToCheck?.replace('+', '') || '',
        },
        theme: {
          color: "#d4af7d",
        },
        modal: {
          ondismiss: function () {
            setIsOrdering(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
        setIsOrdering(false);
      });
      console.log("Opening Razorpay...");
      razorpay.open();
      return;
    }
    
    // For other payment methods, create order directly
    setIsOrdering(true);
    try {
      console.log("Creating order for", paymentMethod);
      await createOrder({ 
        tableId: tableId.toString(), 
        items: cart.map((item) => ({ 
          menuItemId: item.menuItemId, 
          name: item.name, 
          price: item.price, 
          quantity: item.quantity, 
          image: item.image 
        })), 
        total: finalTotal, 
        paymentMethod, 
        notes: notes || "", 
        customerSessionId: sessionId,
        customerPhone: phoneForDeposit,
        depositUsed: depositToUse || 0
      });
      console.log("Order created successfully");
      clearCart();
      // Show success, play sound
      console.log("Showing success screen");
      setShowOrderSuccess(true);
      // Play success sound
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
      } catch(e) {}
    } catch (error) {
      console.error("Failed to place order:", error);
      setIsOrdering(false);
    }
  };

  // Order success overlay - check this FIRST before empty cart
  if (showOrderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[--bg]">
        <div className="text-center animate-scale-in">
          <img src="/payment-success.gif" alt="Order success" className="w-32 h-32 mx-auto mb-6" />
          <h1 className="font-luxury text-2xl font-semibold text-[--text-primary] mb-2">Order Received!</h1>
          <p className="text-[--text-muted] text-sm mb-6">Your order is being prepared</p>
          <Link href="/my-orders" className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold">
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[--bg]">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <header className="p-4">
          <Link href={`/menu/${tableId}`} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[--card] border border-[--border]">
            <ArrowLeft size={18} className="text-[--text-muted]" />
          </Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          {/* Animated empty plate illustration */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[--card] to-[--bg-elevated] border-4 border-[--border] flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 rounded-full bg-[--bg] border-2 border-dashed border-[--border] flex items-center justify-center">
                <span className="text-4xl animate-bounce">🍽️</span>
              </div>
            </div>
            {/* Floating food icons */}
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>🍕</div>
            <div className="absolute -bottom-1 -left-3 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🍔</div>
            <div className="absolute top-1/2 -right-6 text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>🍟</div>
          </div>
          
          <h1 className="font-luxury text-2xl font-semibold text-[--text-primary] mb-2">Your cart is hungry!</h1>
          <p className="text-[--text-muted] text-sm mb-8 text-center">Let's fill it up with some delicious food</p>
          
          <Link 
            href={`/menu/${tableId}`} 
            className="btn-primary px-8 py-4 rounded-xl text-sm font-semibold flex items-center gap-2 group"
          >
            <span>Explore Menu</span>
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--bg] pb-36">
      {/* Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[--bg]/90 backdrop-blur-xl border-b border-[--border]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/menu/${tableId}`} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[--card] border border-[--border]">
            <ArrowLeft size={18} className="text-[--text-muted]" />
          </Link>
          <div className="text-center">
            <h1 className="font-semibold text-[--text-primary]">Your Cart</h1>
            <p className="text-[10px] text-[--text-dim]">{cartCount} items • Table {tableId}</p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Deposit Banner - show if has credit */}
        {depositBalance > 0 && (
          <div className=" rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Ticket size={20} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-emerald-400 font-semibold text-sm">₹{depositBalance} Credit Applied</p>
                <p className="text-emerald-400/60 text-xs">From reservation deposit</p>
              </div>
              {couponApplied && (
                <button onClick={handleRemoveCoupon} className="text-emerald-400/60 hover:text-emerald-400">
                  <X size={18} />
                </button>
              )}
              <Check size={18} className="text-emerald-400" />
            </div>
          </div>
        )}

        {/* Coupon Input - show if no stored credit and no coupon applied with credit */}
        {!hasStoredCredit && !(couponApplied && depositBalance > 0) && (
          <div className="mb-4">
            {!showCouponInput ? (
              <button 
                onClick={() => setShowCouponInput(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[--border] rounded-xl text-[--text-muted] text-sm hover:border-[--primary] hover:text-[--primary] transition-colors"
              >
                <Ticket size={16} />
                Have a reservation? Enter phone for credit
              </button>
            ) : (
              <div className="bg-[--card] border border-[--border] rounded-xl p-4 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
                <p className="text-xs text-[--text-dim] mb-3">Enter reservation phone number</p>
                <div className="flex gap-2">
                  <div className="flex items-center bg-[--bg-elevated] border border-[--border] rounded-lg overflow-hidden flex-1">
                    <span className="px-3 py-2.5 text-[--text-muted] text-sm border-r border-[--border]">+91</span>
                    <input
                      type="tel"
                      value={couponPhone}
                      onChange={(e) => { setCouponPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setCouponError(''); }}
                      placeholder="10 digit number"
                      maxLength={10}
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                      autoFocus
                    />
                  </div>
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={couponPhone.length !== 10}
                    className="px-4 py-2.5 bg-[--primary] text-[--bg] rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    Apply
                  </button>
                  <button 
                    onClick={() => { setShowCouponInput(false); setCouponPhone(''); setCouponError(''); }}
                    className="px-3 py-2.5 text-[--text-muted]"
                  >
                    <X size={18} />
                  </button>
                </div>
                {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
                {couponApplied && depositBalance === 0 && (
                  <p className="text-amber-400 text-xs mt-2">No credit found for this number</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-3 mb-4">
          {cart.map((item, index) => (
            <div 
              key={item.menuItemId} 
              className="bg-[--card] border border-[--border] rounded-2xl p-3 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex gap-3">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[--bg-elevated]">
                  <MenuItemImage storageId={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="font-medium text-[--text-primary] text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-[--primary] font-semibold text-sm mt-0.5">₹{item.price}</p>
                  </div>
                  
                  {/* Quantity & Delete */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-[--bg-elevated] rounded-lg p-0.5">
                      <button 
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} 
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[--card] active:scale-95 transition-all"
                      >
                        <Minus size={14} className="text-[--text-muted]" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-[--text-primary]">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} 
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[--card] active:scale-95 transition-all"
                      >
                        <Plus size={14} className="text-[--primary]" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.menuItemId)} 
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 active:scale-95 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right py-0.5">
                  <p className="text-[--text-primary] font-bold text-sm">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More */}
        <Link 
          href={`/menu/${tableId}`}
          className="flex items-center justify-center gap-2 py-3 text-[--primary] text-sm font-medium hover:underline"
        >
          <Plus size={16} />
          Add more items
        </Link>

        {/* Special Instructions */}
        <div className="mt-4">
          <button 
            onClick={() => setShowNotes(!showNotes)}
            className="w-full flex items-center justify-between p-4 bg-[--card] border border-[--border] rounded-xl"
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={18} className="text-[--text-muted]" />
              <span className="text-sm text-[--text-muted]">
                {notes ? notes.slice(0, 30) + (notes.length > 30 ? '...' : '') : 'Add special instructions'}
              </span>
            </div>
            <ChevronRight size={18} className={`text-[--text-dim] transition-transform duration-300 ${showNotes ? 'rotate-90' : ''}`} />
          </button>
          <div className={`grid transition-all duration-300 ease-out ${showNotes ? 'grid-rows-[1fr] mt-2' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Allergies, spice level, special requests..." 
                className="w-full rounded-xl p-4 text-sm resize-none bg-[--card] border border-[--border] focus:border-[--primary] outline-none" 
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="mt-6">
          <p className="text-[10px] tracking-[0.2em] text-[--text-dim] mb-3 uppercase font-medium">Your Phone Number</p>
          <div className="flex items-center bg-[--card] border border-[--border] rounded-xl overflow-hidden">
            <span className="px-4 py-3 text-[--text-muted] text-sm border-r border-[--border]">+91</span>
            <input
              type="tel"
              value={orderPhone}
              onChange={(e) => { setOrderPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setPhoneError(''); }}
              placeholder="10 digit number"
              maxLength={10}
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
            />
          </div>
          {phoneError && <p className="text-red-400 text-xs mt-2">{phoneError}</p>}
        </div>

        {/* Payment Method */}
        <div className="mt-6">
          <p className="text-[10px] tracking-[0.2em] text-[--text-dim] mb-3 uppercase font-medium">How would you like to pay?</p>
          <div className="grid grid-cols-3 gap-2">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = paymentMethod === option.id;
              return (
                <button 
                  key={option.id} 
                  onClick={() => setPaymentMethod(option.id)} 
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all active:scale-95 ${
                    isSelected 
                      ? "border-[--primary] bg-[--primary]/10" 
                      : "border-[--border] bg-[--card]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                    isSelected ? "bg-[--primary] text-[--bg]" : "bg-[--bg-elevated] text-[--text-muted]"
                  }`}>
                    <Icon size={18} />
                  </div>
                  <p className={`text-xs font-medium text-center ${isSelected ? "text-[--primary]" : "text-[--text-muted]"}`}>
                    {option.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-[--bg] border-t border-[--border]">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Compact Bill Summary - Clickable */}
          <button 
            onClick={() => setShowBillDetails(!showBillDetails)}
            className="w-full flex items-center justify-between mb-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-[--text-muted]">{cartCount} items</span>
              {depositToUse > 0 && (
                <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded">-₹{depositToUse}</span>
              )}
              <ChevronRight size={14} className={`text-[--text-dim] transition-transform ${showBillDetails ? 'rotate-90' : ''}`} />
            </div>
            <span className="font-bold text-lg text-[--primary]">₹{finalTotal.toFixed(0)}</span>
          </button>

          {/* Expanded Bill Details */}
          <div 
            className={`grid transition-all duration-300 ease-out ${showBillDetails ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden">
              <div className="bg-[--card] border border-[--border] rounded-xl p-3 mb-3 text-sm">
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.menuItemId} className="flex justify-between text-[--text-muted]">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="border-t border-[--border] pt-2 flex justify-between">
                    <span className="text-[--text-muted]">Subtotal</span>
                    <span className="text-[--text-primary]">₹{cartTotal.toFixed(0)}</span>
                  </div>
                  {depositToUse > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Reservation Credit</span>
                      <span>-₹{depositToUse.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="border-t border-[--border] pt-2 flex justify-between font-semibold">
                    <span className="text-[--text-primary]">Total</span>
                    <span className="text-[--primary]">₹{finalTotal.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <button 
            onClick={handleOrder} 
            disabled={isOrdering || !paymentMethod} 
            className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              isOrdering || !paymentMethod 
                ? "bg-[--border] text-[--text-dim] cursor-not-allowed" 
                : "btn-primary"
            }`}
          >
            {isOrdering ? (
              <>
                <div className="w-5 h-5 spinner rounded-full" />
                Placing Order...
              </>
            ) : !paymentMethod ? (
              "Select Payment Method"
            ) : (
              <>
                Place Order • ₹{finalTotal.toFixed(0)}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
