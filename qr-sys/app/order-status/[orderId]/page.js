"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  CheckCircle, ChefHat, Truck, Clock, ArrowLeft, 
  CreditCard, Banknote, UserRound 
} from "lucide-react";
import MenuItemImage from "@/components/MenuItemImage";

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

  // Loading state
  if (order === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 spinner rounded-full" />
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center animate-scale-in">
          <div className="text-6xl mb-5">🔍</div>
          <h1 className="font-luxury text-xl font-semibold text-[--text-primary] mb-3">
            Order Not Found
          </h1>
          <Link href="/" className="text-[--primary] text-sm hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCompleted = order.status === "completed";
  const currentStatus = statusSteps[currentStepIndex];
  const PaymentIcon = paymentLabels[order.paymentMethod]?.icon;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="glass sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/my-orders" 
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-[--card] border border-[--border] hover:border-[--border-light] transition-all"
            >
              <ArrowLeft size={18} className="text-[--text-muted]" />
            </Link>
            <div className="text-center">
              <h1 className="font-luxury text-lg font-semibold text-[--text-primary]">Order Status</h1>
              <p className="text-xs text-[--text-muted]">#{order.orderNumber || order._id.slice(-4)}</p>
            </div>
            <div className="w-11" />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Current Status Hero */}
        <div className="text-center mb-10 animate-scale-in">
          <div className={`w-24 h-24 mx-auto mb-5 rounded-2xl flex items-center justify-center ${currentStatus.cls} animate-glow`}>
            <currentStatus.icon size={40} />
          </div>
          <h2 className="font-luxury text-2xl font-semibold text-[--text-primary] mb-2">
            {currentStatus.label}
          </h2>
          {order.paymentMethod && paymentLabels[order.paymentMethod] && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-[--card] border border-[--border] text-[--text-muted] text-xs">
              {PaymentIcon && <PaymentIcon size={14} />}
              {paymentLabels[order.paymentMethod].label}
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="card rounded-xl p-6 mb-6 animate-slide-up">
          <div className="relative">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === statusSteps.length - 1;
              
              return (
                <div key={step.key} className="flex items-start gap-4 relative">
                  {/* Connector line */}
                  {!isLast && (
                    <div 
                      className={`absolute left-5 top-10 w-0.5 h-10 transition-colors duration-500 ${
                        index < currentStepIndex ? 'bg-[--primary]' : 'bg-[--border]'
                      }`} 
                    />
                  )}
                  
                  {/* Step icon */}
                  <div 
                    className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      isActive ? step.cls : 'bg-[--card] border border-[--border]'
                    }`}
                  >
                    <Icon size={18} className={isActive ? '' : 'text-[--text-dim]'} />
                  </div>
                  
                  {/* Step label */}
                  <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                    <p className={`text-sm font-medium transition-colors ${
                      isActive ? "text-[--text-primary]" : "text-[--text-dim]"
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && !isCompleted && (
                      <span className="inline-flex items-center gap-2 text-xs mt-1 text-[--primary]">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[--primary]" />
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card rounded-xl p-6 mb-6 animate-slide-up delay-100" style={{animationFillMode: 'forwards'}}>
          <h3 className="text-[10px] tracking-[0.2em] text-[--text-muted] uppercase mb-5">
            Order Summary
          </h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[--bg-elevated] border border-[--border] rounded-lg flex items-center justify-center overflow-hidden">
                    <MenuItemImage storageId={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm text-[--text-primary]">{item.name}</p>
                    <p className="text-xs text-[--text-dim]">× {item.quantity}</p>
                  </div>
                </div>
                <span className="text-sm text-[--text-muted]">
                  ₹{(item.price * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="divider-glow my-5" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-[--text-muted]">Total</span>
            <span className="text-xl font-luxury font-semibold text-gradient">
              ₹{order.total.toFixed(0)}
            </span>
          </div>
          
          {order.notes && (
            <div className="mt-5 p-4 bg-[--primary]/5 border border-[--primary]/20 rounded-xl">
              <p className="text-xs text-[--primary]">📝 {order.notes}</p>
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="text-center text-xs text-[--text-dim] mb-6">
          Table {order.tableId} • {new Date(order._creationTime).toLocaleString()}
        </div>

        {/* Actions */}
        <div className="space-y-3 animate-fade-in delay-200" style={{animationFillMode: 'forwards'}}>
          <Link 
            href="/my-orders" 
            className="block text-center btn-secondary py-4 rounded-xl text-sm font-medium"
          >
            ← All Orders
          </Link>
          {isCompleted && (
            <Link 
              href="/" 
              className="block text-center btn-primary py-4 rounded-xl text-sm font-semibold"
            >
              Order Again
            </Link>
          )}
        </div>

        {/* Live update notice */}
        {!isCompleted && (
          <div className="mt-6 p-4 bg-[--primary]/5 border border-[--primary]/20 rounded-xl text-center animate-fade-in delay-300" style={{animationFillMode: 'forwards'}}>
            <p className="text-xs text-[--primary]">
              🔄 Live updates enabled • Sit back and relax
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
