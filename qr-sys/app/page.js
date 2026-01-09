"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/session";
import { ChevronRight, History, ArrowRight } from "lucide-react";
import { isRestaurantOpen } from "@/components/ClosedPopup";

export default function Home() {
  const router = useRouter();
  const { sessionId } = useSession();
  const [tableNumber, setTableNumber] = useState("");
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [dismissedClosed, setDismissedClosed] = useState(false);

  const activeOrder = useQuery(
    api.orders.getActiveBySession,
    sessionId ? { sessionId } : "skip"
  );
  const hasOrders = useQuery(
    api.orders.hasOrders,
    sessionId ? { sessionId } : "skip"
  );

  // Check if dismissed closed popup in session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('closed-popup-dismissed');
    if (wasDismissed) setDismissedClosed(true);
  }, []);

  useEffect(() => {
    if (activeOrder) {
      router.replace(`/my-orders`);
    }
  }, [activeOrder, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const num = parseInt(tableNumber);
    if (!tableNumber || isNaN(num) || num < 1) {
      setError("Please enter a valid table number");
      return;
    }
    router.push(`/menu/${num}`);
  };

  const handleDismissClosed = () => {
    setDismissedClosed(true);
    sessionStorage.setItem('closed-popup-dismissed', 'true');
  };

  // Full screen closed alert
  if (!isRestaurantOpen() && !dismissedClosed) {
    const now = new Date();
    const hour = now.getHours();
    const OPEN_HOUR = 12;
    let hoursUntilOpen = hour < OPEN_HOUR ? OPEN_HOUR - hour : (24 - hour) + OPEN_HOUR;

    return (
      <div className="min-h-screen flex flex-col">
        <div className="p-5 flex items-center justify-center opacity-0 animate-slide-down" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="BTS DISC" className="h-9 w-9 rounded-full object-contain" />
            <span className="text-[--text-dim] text-xs tracking-[0.15em] uppercase">BTS DISC</span>
          </div>
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
          <Link 
            href="/book"
            className="btn-primary w-full py-4 rounded-xl text-sm font-medium opacity-0 animate-slide-up block text-center"
            style={{animationDelay: '0.9s', animationFillMode: 'forwards'}}
          >
            Book for Future
          </Link>
          <Link 
            href="/staff"
            className="block w-full py-3 text-center text-[--text-muted] text-sm hover:text-[--text-primary] transition-colors opacity-0 animate-slide-up"
            style={{animationDelay: '1s', animationFillMode: 'forwards'}}
          >
            Staff Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8">
      {/* Subtle glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[--primary] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-xs">
        {/* Logo & Branding - Compact */}
        <div className="text-center mb-6 animate-slide-up">
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 bg-[--primary] opacity-15 blur-xl  scale-125" />
            <img 
              src="/logo.png" 
              alt="BTS DISC" 
              className="relative rounded-full h-16 w-16 mx-auto object-contain" 
            />
          </div>
          <h1 className="font-luxury text-xl font-semibold text-[--text-primary] tracking-wide">
            BTS DISC
          </h1>
          <p className="text-[--text-dim] text-[10px] tracking-[0.25em] uppercase mt-0.5">
            Private Limited
          </p>
        </div>

        {/* Table Entry Card - Compact */}
        <form 
          onSubmit={handleSubmit} 
          className="card rounded-xl p-5 opacity-0 animate-scale-in delay-200"
          style={{ animationFillMode: 'forwards' }}
        >
          <p className="text-center text-[--text-muted] text-xs mb-4">
            Enter your table number
          </p>

          <div className="mb-3">
            <div className={`relative transition-all duration-200 ${isFocused ? 'scale-[1.01]' : ''}`}>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => { setTableNumber(e.target.value); setError(""); }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="00"
                className="w-full text-center text-3xl font-luxury font-semibold rounded-lg py-3 px-3 tracking-wider !bg-[--bg] !border-[--border]"
                min="1"
                autoFocus
              />
              {isFocused && (
                <div className="absolute inset-0 rounded-lg border border-[--primary]/50 pointer-events-none" />
              )}
            </div>
          </div>

          {error && (
            <p className="text-[--error] text-[11px] text-center mb-3 animate-scale-in">
              {error}
            </p>
          )}

          <button 
            type="submit" 
            className="btn-primary w-full py-3 rounded-lg text-xs flex justify-center items-center gap-2 group"
          >
            <span>Continue</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        {/* Order History Link - Compact */}
        {hasOrders && (
          <Link 
            href="/my-orders" 
            className="mt-3 w-full flex items-center justify-between card rounded-lg py-3 px-4 opacity-0 animate-fade-in delay-400 group"
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[--primary]/10 flex items-center justify-center">
                <History size={14} className="text-[--primary]" />
              </div>
              <div className="text-left">
                <span className="text-[--text-primary] text-xs font-medium block">My Orders</span>
                <span className="text-[--text-dim] text-[10px]">View history</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-[--text-dim] transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}

        {/* Admin Link - Compact */}
        <div className="mt-6 text-center opacity-0 animate-fade-in delay-500" style={{ animationFillMode: 'forwards' }}>
          <Link 
            href="/admin/login" 
            className="inline-flex items-center gap-1.5 text-[--text-dim] hover:text-[--primary] text-[10px] transition-colors tracking-[0.12em] uppercase group"
          >
            <span>Staff Portal</span>
            <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
