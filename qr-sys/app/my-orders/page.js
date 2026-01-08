"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/lib/session";
import { CheckCircle, ChefHat, Truck, Clock, Plus, ChevronRight, Package, X, ArrowRight } from "lucide-react";
import { ChatAssistant } from "@/components/chat";

const statusConfig = {
  pending: { label: "Received", cls: "status-pending", icon: Clock },
  preparing: { label: "Preparing", cls: "status-preparing", icon: ChefHat },
  ready: { label: "Ready", cls: "status-ready", icon: Truck },
  completed: { label: "Done", cls: "status-completed", icon: CheckCircle },
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { sessionId } = useSession();
  const [showPopup, setShowPopup] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const orders = useQuery(api.orders.getBySession, sessionId ? { sessionId } : "skip");
  const lastTableId = orders && orders.length > 0 ? orders[0].tableId : null;

  // Get table info for chat context
  const table = useQuery(api.tables.getByNumber, lastTableId ? { number: parseInt(lastTableId) } : "skip");
  const menuItems = useQuery(api.menuItems.listForZone, table !== undefined ? { zoneId: table?.zoneId } : "skip");
  const activeOrder = orders && orders.length > 0 ? orders.find(o => o.status !== "completed") : null;

  const handleSameTable = () => { if (lastTableId) router.push(`/menu/${lastTableId}`); setShowPopup(false); };
  const handleNewTable = () => { const num = parseInt(newTableNumber); if (newTableNumber && !isNaN(num) && num > 0) { router.push(`/menu/${num}`); setShowPopup(false); } };

  if (orders === undefined) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[--primary] border-t-transparent rounded-full animate-spin"></div></div>;

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 bg-[--card] border border-[--border] rounded-full flex items-center justify-center mx-auto mb-4"><Package size={32} className="text-[--primary]" /></div>
          <h1 className="font-luxury text-xl font-semibold text-[--text-primary] mb-2">No Orders Yet</h1>
          <p className="text-[--muted] text-sm mb-6">Start by browsing our menu</p>
          <Link href="/" className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl text-sm"><Plus size={16} />Start Ordering</Link>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== "completed");
  const pastOrders = orders.filter(o => o.status === "completed");

  return (
    <div className="min-h-screen pb-6">
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card rounded-2xl p-5 w-full max-w-xs animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-luxury text-lg font-semibold text-[--text-primary]">New Order</h2>
              <button onClick={() => setShowPopup(false)} className="w-8 h-8 rounded-lg bg-[--bg] border border-[--border] flex items-center justify-center"><X size={16} className="text-[--muted]" /></button>
            </div>
            <div className="h-px bg-[--border] mb-4"></div>
            {lastTableId && (
              <button onClick={handleSameTable} className="w-full p-4 rounded-xl border border-[--border] bg-[--bg] hover:border-[--primary]/50 transition-all mb-3 text-left">
                <p className="text-[--text-primary] font-medium text-sm mb-1">Same Table</p>
                <p className="text-[--muted] text-xs">Continue ordering at Table {lastTableId}</p>
              </button>
            )}
            <div className="p-4 rounded-xl border border-[--border] bg-[--bg]">
              <p className="text-[--text-primary] font-medium text-sm mb-3">Different Table</p>
              <div className=" gap-2">
                <input type="number" value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} placeholder="Table no." className="flex-1 text-center w-full text-sm font-semibold rounded-lg py-2.5 px-3" min="1" />
                <button onClick={handleNewTable} disabled={!newTableNumber} className={`text-center justify-center my-2 w-full rounded-lg py-2.5 px-3 text-sm flex items-center gap-1 ${newTableNumber ? "btn-primary" : "bg-[--border] text-[--muted] cursor-not-allowed"}`}>GO <ArrowRight size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="font-luxury text-lg font-semibold text-[--text-primary]">My Orders</h1>
            <button onClick={() => setShowPopup(true)} className="text-xs text-[--primary] hover:text-[--primary-hover] transition-colors font-medium">+ New Order</button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {activeOrders.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[--primary] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[--primary]"></span></span>
              <h2 className="text-xs tracking-widest text-[--muted] uppercase">Active Orders</h2>
            </div>
            <div className="space-y-3">
              {activeOrders.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                return (
                  <Link key={order._id} href={`/order-status/${order._id}`} className="block card rounded-xl overflow-hidden">
                    <div className="h-1 bg-[--primary]"></div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div><p className="font-semibold text-[--text-primary] text-sm">Order #{order.orderNumber || order._id.slice(-4)}</p><p className="text-xs text-[--muted]">Table {order.tableId}</p></div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${status.cls}`}><StatusIcon size={12} /><span className="text-xs font-medium">{status.label}</span></div>
                      </div>
                      <div className="flex items-center gap-1.5 mb-3">
                        {order.items.slice(0, 4).map((item, i) => (<div key={i} className="w-8 h-8 bg-[--bg] border border-[--border] rounded-md flex items-center justify-center text-sm">{item.image}</div>))}
                        {order.items.length > 4 && <div className="w-8 h-8 bg-[--bg] border border-[--border] rounded-md flex items-center justify-center text-xs text-[--muted]">+{order.items.length - 4}</div>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[--muted]">{new Date(order._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-1"><span className="font-semibold text-[--primary] text-sm">₹{order.total.toFixed(2)}</span><ChevronRight size={14} className="text-[--muted]" /></div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {pastOrders.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-xs tracking-widest text-[--muted] uppercase mb-3">Order History</h2>
            <div className="space-y-2">
              {pastOrders.map((order) => (
                <div key={order._id} className="card rounded-xl p-3 opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <div><p className="font-medium text-[--muted] text-sm">#{order.orderNumber || order._id.slice(-4)}</p><p className="text-xs text-[--muted]/60">{new Date(order._creationTime).toLocaleDateString()}</p></div>
                    <div className="flex items-center gap-1 text-[--success]"><CheckCircle size={12} /><span className="text-xs">Done</span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">{order.items.slice(0, 3).map((item, i) => (<span key={i} className="text-sm">{item.image}</span>))}</div>
                    <span className="font-medium text-[--muted] text-sm">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeOrders.length === 0 && (
          <div className="mt-6 animate-scale-in">
            <button onClick={() => setShowPopup(true)} className="flex items-center justify-center gap-2 btn-primary py-3 rounded-xl font-semibold text-sm w-full"><Plus size={16} />Place New Order</button>
          </div>
        )}
      </div>

      {/* AI Chat Assistant */}
      {table && (
        <ChatAssistant
          tableContext={{
            tableId: lastTableId,
            tableNumber: table.number,
            zoneId: table.zoneId || null,
            zoneName: table.zone?.name || null,
          }}
          menuItems={menuItems || []}
          activeOrder={activeOrder}
        />
      )}
    </div>
  );
}
