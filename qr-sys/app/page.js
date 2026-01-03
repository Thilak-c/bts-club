"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/session";
import { ChevronRight, History, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { sessionId } = useSession();
  const [tableNumber, setTableNumber] = useState("");
  const [error, setError] = useState("");

  const activeOrder = useQuery(
    api.orders.getActiveBySession,
    sessionId ? { sessionId } : "skip"
  );
  const hasOrders = useQuery(
    api.orders.hasOrders,
    sessionId ? { sessionId } : "skip"
  );

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
      setError("Enter valid table number");
      return;
    }
    router.push(`/menu/${num}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-6 animate-slide-up">
          <img src="/logo.png" alt="BTS DISC" className="h-[150px] mx-auto mb-4" />
          <h1 className="font-luxury text-2xl font-bold mb-1 text-[--text-primary]">BTS DISC</h1>
          <p className="text-[--muted] text-xs mb-4">Private Limited</p>
          <p className="text-[--text-secondary] text-sm">Enter your table number</p>
        </div>

        <form onSubmit={handleSubmit} className="card rounded-2xl p-5 animate-scale-in">
          <div className="h-px bg-[--border] mb-5"></div>
          <label className="block text-xs tracking-widest text-[--muted] mb-2 uppercase">Table No.</label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => { setTableNumber(e.target.value); setError(""); }}
            placeholder="Enter table number"
            className="w-full text-center text-xl font-semibold rounded-xl py-3 px-3"
            min="1"
            autoFocus
          />
          <button type="submit" className="btn-primary w-full py-3 px-3 rounded-xl text-sm flex justify-center my-3 items-center gap-1">
            GO <ArrowRight size={16} />
          </button>
          {error && <p className="text-[--error] text-xs mt-2">{error}</p>}
        </form>

        {hasOrders && (
          <Link href="/my-orders" className="mt-4 w-full flex items-center justify-center gap-2 card rounded-xl py-3 px-4 text-sm animate-fade-in">
            <History size={16} className="text-[--primary]" />
            <span className="text-[--text-primary]">My Orders</span>
            <ChevronRight size={14} className="text-[--muted]" />
          </Link>
        )}

        <div className="mt-6 text-center animate-fade-in">
          <Link href="/admin/login" className="text-[--muted] hover:text-[--primary] text-xs transition-colors tracking-widest uppercase">
            Admin →
          </Link>
        </div>
      </div>
    </div>
  );
}
