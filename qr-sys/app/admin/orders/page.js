"use client";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { ArrowLeft, Clock, ChefHat, Truck, CheckCircle } from "lucide-react";

const statusOptions = [
  { value: "pending", label: "Pending", icon: Clock, cls: "status-pending" },
  { value: "preparing", label: "Prep", icon: ChefHat, cls: "status-preparing" },
  { value: "ready", label: "Ready", icon: Truck, cls: "status-ready" },
  { value: "completed", label: "Done", icon: CheckCircle, cls: "status-completed" },
];

const paymentLabels = {
  "pay-now": { label: "Paid", color: "text-[--success]" },
  "pay-counter": { label: "Counter", color: "text-[--primary]" },
  "pay-table": { label: "Table", color: "text-[--info]" },
};

export default function AdminOrdersPage() {
  const { isAuthenticated, loading } = useAdminAuth();
  const orders = useQuery(api.orders.list);
  const updateStatus = useMutation(api.orders.updateStatus);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[--primary] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="w-9 h-9 flex items-center justify-center rounded-lg bg-[--card] border border-[--border] hover:border-[--primary]/30 transition-all">
              <ArrowLeft size={18} className="text-[--muted]" />
            </Link>
            <div>
              <h1 className="font-luxury text-lg font-semibold text-[--text-primary]">Orders</h1>
              <p className="text-xs text-[--muted]">{orders?.length || 0} total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {!orders || orders.length === 0 ? (
          <div className="card rounded-xl p-8 text-center"><p className="text-[--muted]">No orders yet</p></div>
        ) : (
          <div className="space-y-3 stagger-children">
            {orders.map((order) => (
              <div key={order._id} className="card rounded-xl overflow-hidden">
                <div className="p-3 border-b border-[--border] bg-[--bg]/50">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[--text-primary] text-sm">#{order.orderNumber || order._id.slice(-4)}</span>
                      <span className="text-xs text-[--muted] px-2 py-0.5 bg-[--border] rounded">Table {order.tableId}</span>
                      {order.paymentMethod && paymentLabels[order.paymentMethod] && (
                        <span className={`text-xs ${paymentLabels[order.paymentMethod].color}`}>{paymentLabels[order.paymentMethod].label}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {statusOptions.map((status) => {
                        const Icon = status.icon;
                        const isActive = order.status === status.value;
                        return (
                          <button key={status.value} onClick={() => updateStatus({ id: order._id, status: status.value })}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${isActive ? status.cls : "opacity-50 hover:opacity-100 text-[--muted]"}`}>
                            <Icon size={12} /><span className="hidden sm:inline">{status.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 bg-[--bg] border border-[--border] rounded-lg px-2 py-1">
                        <span className="text-sm">{item.image}</span>
                        <span className="text-xs text-[--text-primary]">{item.name}</span>
                        <span className="text-xs text-[--muted]">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {order.notes && <div className="p-2 bg-[--primary]/10 border border-[--primary]/20 rounded-lg text-xs text-[--primary] mb-3">📝 {order.notes}</div>}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[--muted]">{new Date(order._creationTime).toLocaleString()}</span>
                    <span className="font-semibold text-[--primary]">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
