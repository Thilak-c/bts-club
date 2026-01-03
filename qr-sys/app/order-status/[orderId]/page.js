"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle, ChefHat, Truck, Clock, ArrowLeft, CreditCard, Banknote, UserRound } from "lucide-react";

const statusSteps = [
  { key: "pending", label: "Received", icon: Clock, cls: "status-pending" },
  { key: "preparing", label: "Preparing", icon: ChefHat, cls: "status-preparing" },
  { key: "ready", label: "Ready", icon: Truck, cls: "status-ready" },
  { key: "completed", label: "Completed", icon: CheckCircle, cls: "status-completed" },
];

const paymentLabels = {
  "pay-now": { label: "Paid Online", icon: CreditCard },
  "pay-counter": { label: "Pay at Counter", icon: Banknote },
  "pay-table": { label: "Pay at Table", icon: UserRound },
};

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const order = useQuery(api.orders.getById, { id: orderId });

  if (order === undefined) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[--primary] border-t-transparent rounded-full animate-spin"></div></div>;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="text-4xl mb-3">🔍</div>
          <h1 className="font-luxury text-lg font-semibold text-[--text-primary] mb-2">Order Not Found</h1>
          <Link href="/" className="text-[--primary] text-sm hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCompleted = order.status === "completed";
  const currentStatus = statusSteps[currentStepIndex];
  const PaymentIcon = paymentLabels[order.paymentMethod]?.icon;

  return (
    <div className="min-h-screen pb-6">
      <div className="glass sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/my-orders" className="w-9 h-9 flex items-center justify-center rounded-lg bg-[--card] border border-[--border] hover:border-[--primary]/30 transition-all"><ArrowLeft size={18} className="text-[--muted]" /></Link>
            <div className="text-center"><h1 className="font-luxury text-lg font-semibold text-[--text-primary]">Order Status</h1><p className="text-xs text-[--muted]">#{order.orderNumber || order._id.slice(-4)}</p></div>
            <div className="w-9"></div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-6 animate-scale-in">
          <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${currentStatus.cls}`}>
            <currentStatus.icon size={36} />
          </div>
          <h2 className="font-luxury text-xl font-semibold text-[--text-primary] mb-1">{currentStatus.label}</h2>
          {order.paymentMethod && paymentLabels[order.paymentMethod] && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[--card] border border-[--border] text-[--muted] text-xs">
              {PaymentIcon && <PaymentIcon size={12} />}{paymentLabels[order.paymentMethod].label}
            </div>
          )}
        </div>

        <div className="card rounded-xl p-5 mb-5 animate-slide-up">
          <div className="relative">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === statusSteps.length - 1;
              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {!isLast && <div className={`absolute left-4 top-8 w-0.5 h-8 ${index < currentStepIndex ? 'bg-[--primary]' : 'bg-[--border]'}`}></div>}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? step.cls : 'bg-[--card] border border-[--border]'}`}>
                    <Icon size={16} className={isActive ? '' : 'text-[--muted]'} />
                  </div>
                  <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                    <p className={`text-sm font-medium ${isActive ? "text-[--text-primary]" : "text-[--muted]/50"}`}>{step.label}</p>
                    {isCurrent && !isCompleted && <span className="inline-flex items-center gap-1 text-xs mt-0.5 text-[--primary]"><span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[--primary]"></span>In Progress</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card rounded-xl p-5 mb-5 animate-slide-up">
          <h3 className="text-xs tracking-widest text-[--muted] uppercase mb-4">Order Summary</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[--bg] border border-[--border] rounded-md flex items-center justify-center text-sm">{item.image}</div>
                  <div><p className="text-sm text-[--text-primary]">{item.name}</p><p className="text-xs text-[--muted]">× {item.quantity}</p></div>
                </div>
                <span className="text-sm text-[--muted]">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[--border] mt-4 pt-4 flex justify-between items-center">
            <span className="text-sm text-[--muted]">Total</span>
            <span className="text-lg font-semibold text-[--primary]">${order.total.toFixed(2)}</span>
          </div>
          {order.notes && <div className="mt-4 p-3 bg-[--primary]/10 border border-[--primary]/20 rounded-lg"><p className="text-xs text-[--primary]">📝 {order.notes}</p></div>}
        </div>

        <div className="text-center text-xs text-[--muted] mb-5">Table {order.tableId} • {new Date(order._creationTime).toLocaleString()}</div>

        <div className="space-y-2 animate-fade-in">
          <Link href="/my-orders" className="block text-center card rounded-xl py-3 text-sm text-[--muted] hover:border-[--primary]/30 transition-all">← All Orders</Link>
          {isCompleted && <Link href="/" className="block text-center btn-primary py-3 rounded-xl text-sm font-semibold">Order Again</Link>}
        </div>

        {!isCompleted && <div className="mt-5 p-3 bg-[--primary]/10 border border-[--primary]/20 rounded-xl text-center animate-fade-in"><p className="text-xs text-[--primary]">🔄 Live updates • Sit back and relax</p></div>}
      </div>
    </div>
  );
}
