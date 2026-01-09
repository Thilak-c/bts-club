"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HelpCircle, Bell, ClipboardList, X, Check } from "lucide-react";
import { isRestaurantOpen } from "@/components/ClosedPopup";

export default function CallStaffButton({ tableId, tableNumber, zoneName }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reason, setReason] = useState("");
  const createCall = useMutation(api.staffCalls.create);

  const reasons = ["Need assistance", "Ready to order", "Request bill"];

  const handleCall = async (selectedReason) => {
    if (!tableNumber) return;
    
    await createCall({
      tableId: tableId || String(tableNumber),
      tableNumber: parseInt(tableNumber),
      zoneName: zoneName || undefined,
      reason: selectedReason || reason || "Assistance needed",
    });
    
    setShowCallModal(false);
    setIsOpen(false);
    setReason("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Don't show if no table or restaurant is closed
  if (!tableNumber || !isRestaurantOpen()) return null;

  return (
    <>
      {/* Help Bubble */}
      <div className="fixed bottom-20 right-3 z-30">
        {/* Menu Options */}
        {isOpen && (
          <div className="absolute bottom-12 right-0 mb-2 animate-scale-in" style={{animationFillMode: 'forwards'}}>
            <div className="card rounded-xl p-1.5 min-w-[140px] shadow-xl">
              <button
                onClick={() => { router.push('/my-orders'); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[--text-secondary] hover:bg-[--bg-elevated] hover:text-[--text-primary] transition-all text-[11px]"
              >
                <ClipboardList size={14} className="text-[--primary]" />
                Order Status
              </button>
              <button
                onClick={() => { setShowCallModal(true); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[--text-secondary] hover:bg-[--bg-elevated] hover:text-[--text-primary] transition-all text-[11px]"
              >
                <Bell size={14} className="text-[--primary]" />
                Call Staff
              </button>
            </div>
          </div>
        )}

        {/* Bubble Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all ${
            isOpen 
              ? 'bg-[--primary] text-[--bg]' 
              : 'bg-[--card] border border-[--border] text-[--text-muted] hover:border-[--primary]/30 hover:text-[--primary]'
          }`}
        >
          {isOpen ? <X size={14} /> : <HelpCircle size={15} />}
        </button>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-20 right-3 z-50 animate-slide-up" style={{animationFillMode: 'forwards'}}>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-[11px]">
            <Check size={12} />
            Staff notified
          </div>
        </div>
      )}

      {/* Call Staff Modal */}
      {showCallModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center p-3 pb-5"
          onClick={() => setShowCallModal(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div 
            className="relative w-full max-w-xs card rounded-xl p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{animationFillMode: 'forwards'}}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[--text-primary] font-medium text-sm">Call Staff</h3>
                <p className="text-[--text-dim] text-[10px]">Table {tableNumber}</p>
              </div>
              <button 
                onClick={() => setShowCallModal(false)}
                className="w-7 h-7 rounded-md bg-[--bg-elevated] flex items-center justify-center"
              >
                <X size={12} className="text-[--text-muted]" />
              </button>
            </div>

            <div className="space-y-1.5 mb-3">
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => handleCall(r)}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border] text-[--text-secondary] text-[11px] hover:border-[--primary]/30 hover:text-[--text-primary] transition-all active:scale-[0.98]"
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Or type a message..."
                className="w-full rounded-lg px-3 py-2.5 text-[11px] pr-14"
              />
              {reason && (
                <button
                  onClick={() => handleCall(reason)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary px-2.5 py-1 rounded-md text-[10px]"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
