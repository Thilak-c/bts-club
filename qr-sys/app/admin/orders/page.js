"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAdminAuth } from "@/lib/useAdminAuth";
import MenuItemImage from "@/components/MenuItemImage";

const statusOptions = [
  { value: "pending", label: "PENDING" },
  { value: "preparing", label: "PREP" },
  { value: "ready", label: "READY" },
  { value: "completed", label: "DONE" },
];

const paymentLabels = {
  "pay-now": { label: "PAID", color: "text-emerald-400" },
  "pay-counter": { label: "COUNTER", color: "text-amber-400" },
  "pay-table": { label: "TABLE", color: "text-blue-400" },
};

export default function AdminOrdersPage() {
  const { isAuthenticated, loading } = useAdminAuth();
  const orders = useQuery(api.orders.list);
  const updateStatus = useMutation(api.orders.updateStatus);

  if (loading || !isAuthenticated) return null;

  const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0;
  const pendingCount = orders?.filter(o => o.status === 'pending').length || 0;

  return (
    <div className="p-6">
      <div className="mb-6 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">ORDERS</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest">{orders?.length || 0} total • {pendingCount} pending • ₹{totalRevenue.toFixed(0)} revenue</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
          <p className="text-zinc-600">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-zinc-900 border border-zinc-800">
              {/* Header */}
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold">#{order.orderNumber || order._id.slice(-4)}</span>
                  <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5">TABLE {order.tableId}</span>
                  {order.paymentMethod && paymentLabels[order.paymentMethod] && (
                    <span className={`text-[10px] ${paymentLabels[order.paymentMethod].color}`}>
                      {paymentLabels[order.paymentMethod].label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {statusOptions.map((status) => {
                    const isActive = order.status === status.value;
                    return (
                      <button
                        key={status.value}
                        onClick={() => updateStatus({ id: order._id, status: status.value })}
                        className={`px-3 py-1 text-[10px] uppercase tracking-wide transition-colors ${
                          isActive
                            ? status.value === 'pending' ? 'bg-amber-600 text-black'
                            : status.value === 'preparing' ? 'bg-blue-600 text-white'
                            : status.value === 'ready' ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-600 text-white'
                            : 'bg-zinc-800 text-zinc-500 hover:text-white'
                        }`}
                      >
                        {status.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5">
                      <MenuItemImage storageId={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-zinc-500 text-xs">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="p-2 bg-amber-950/30 border border-amber-900/50 text-xs text-amber-400 mb-3">
                    📝 {order.notes}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600">{new Date(order._creationTime).toLocaleString()}</span>
                  <span className="font-bold text-lg">₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
