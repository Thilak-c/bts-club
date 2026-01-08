"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Calendar, Clock, Users, Check, Armchair } from "lucide-react";
import Link from "next/link";

export default function BookTablePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward'); // 'forward' or 'back'
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    startTime: "18:00",
    endTime: "20:00",
    partySize: 2,
    notes: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const tables = useQuery(api.tables.list);
  const createReservation = useMutation(api.reservations.create);
  const reservations = useQuery(api.reservations.list, { date: selectedDate });

  const getTableReservations = (tableId) => {
    return reservations?.filter(r => r.tableId === tableId && r.status === "confirmed") || [];
  };

  const goToStep = (newStep) => {
    setDirection(newStep > step ? 'forward' : 'back');
    setStep(newStep);
  };

  const handleSubmit = async () => {
    if (!selectedTable || !formData.customerName || !formData.startTime || !formData.endTime) {
      setError("Please fill all required fields");
      return;
    }
    try {
      setError("");
      await createReservation({
        tableId: selectedTable._id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone || undefined,
        date: selectedDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        partySize: formData.partySize,
        notes: formData.notes || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Success screen with animations
  if (success) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 opacity-0 animate-bounce-in" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
            <Check size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-[--text-primary] mb-2 opacity-0 animate-slide-up" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>Booking Confirmed!</h1>
          <p className="text-[--muted] text-sm mb-6 opacity-0 animate-slide-up" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
            Your table has been reserved
          </p>
          
          <div className="card rounded-2xl p-6 mb-6 opacity-0 animate-scale-in" style={{animationDelay: '0.5s', animationFillMode: 'forwards'}}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[--primary]/20 rounded-xl flex items-center justify-center">
                <Armchair size={24} className="text-[--primary]" />
              </div>
              <div className="text-left">
                <p className="font-bold text-[--text-primary] text-lg">{selectedTable?.name}</p>
                <p className="text-xs text-[--muted]">{formData.partySize} guests</p>
              </div>
            </div>
            <div className="h-px bg-[--border] my-4"></div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-[--muted] text-xs mb-1">Date</p>
                <p className="font-semibold text-[--text-primary]">{selectedDate}</p>
              </div>
              <div className="w-px h-8 bg-[--border]"></div>
              <div className="text-center">
                <p className="text-[--muted] text-xs mb-1">Time</p>
                <p className="font-semibold text-[--text-primary]">{formData.startTime} - {formData.endTime}</p>
              </div>
            </div>
          </div>
          
          <Link href="/" className="btn-primary px-8 py-4 rounded-xl inline-block font-semibold opacity-0 animate-slide-up" style={{animationDelay: '0.7s', animationFillMode: 'forwards'}}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const animationClass = direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';

  return (
    <div className="min-h-screen bg-[--bg] pb-24">
      {/* Header */}
      <div className="glass sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[--card] border border-[--border] hover:border-[--primary]/30 transition-all active:scale-95">
              <ArrowLeft size={18} className="text-[--muted]" />
            </button>
            <div className="text-center">
              <h1 className="font-bold text-[--text-primary]">Book a Table</h1>
              <p className="text-xs text-[--muted]">Step {step} of 3</p>
            </div>
            <div className="w-9"></div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative">
              <div className={`w-10 h-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[--primary]' : 'bg-[--border]'}`} />
              {step === s && (
                <div className="absolute inset-0 bg-[--primary] rounded-full animate-pulse-soft" />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 animate-scale-in">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Select Date & Time */}
        {step === 1 && (
          <div key="step1" className={`space-y-4 opacity-0 ${animationClass}`} style={{animationFillMode: 'forwards'}}>
            <div className="card rounded-xl p-4 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[--primary]/20 rounded-lg flex items-center justify-center animate-float">
                  <Calendar size={20} className="text-[--primary]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[--text-primary]">Select Date</h2>
                  <p className="text-xs text-[--muted]">When would you like to visit?</p>
                </div>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                max={maxDate}
                className="w-full bg-[--bg] border border-[--border] rounded-xl px-4 py-3 text-[--text-primary] transition-all focus:scale-[1.02]"
              />
            </div>

            <div className="card rounded-xl p-4 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[--primary]/20 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '0.5s'}}>
                  <Clock size={20} className="text-[--primary]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[--text-primary]">Select Time</h2>
                  <p className="text-xs text-[--muted]">Choose your preferred time slot</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[--muted] mb-1 block">From</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-[--bg] border border-[--border] rounded-xl px-4 py-3 text-[--text-primary]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[--muted] mb-1 block">To</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-[--bg] border border-[--border] rounded-xl px-4 py-3 text-[--text-primary]"
                  />
                </div>
              </div>
            </div>

            <div className="card rounded-xl p-4 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[--primary]/20 rounded-lg flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                  <Users size={20} className="text-[--primary]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[--text-primary]">Party Size</h2>
                  <p className="text-xs text-[--muted]">How many guests?</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setFormData({ ...formData, partySize: Math.max(1, formData.partySize - 1) })}
                  className="w-12 h-12 rounded-xl bg-[--bg] border border-[--border] flex items-center justify-center text-[--muted] hover:border-[--primary]/30 hover:text-[--primary] transition-all active:scale-90 text-xl"
                >
                  -
                </button>
                <span className="text-3xl font-bold text-[--text-primary] w-16 text-center">{formData.partySize}</span>
                <button
                  onClick={() => setFormData({ ...formData, partySize: formData.partySize + 1 })}
                  className="w-12 h-12 rounded-xl bg-[--bg] border border-[--border] flex items-center justify-center text-[--muted] hover:border-[--primary]/30 hover:text-[--primary] transition-all active:scale-90 text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <button onClick={() => goToStep(2)} className="w-full btn-primary py-4 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform">
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Select Table */}
        {step === 2 && (
          <div key="step2" className={`space-y-4 opacity-0 ${animationClass}`} style={{animationFillMode: 'forwards'}}>
            <div className="mb-4">
              <h2 className="font-semibold text-[--text-primary] mb-1">Available Tables</h2>
              <p className="text-xs text-[--muted]">
                {selectedDate} • {formData.startTime} - {formData.endTime} • {formData.partySize} guests
              </p>
            </div>

            <div className="space-y-3 stagger-children">
              {tables?.map((table, index) => {
                const tableRes = getTableReservations(table._id);
                const hasConflict = tableRes.some(r => 
                  (formData.startTime >= r.startTime && formData.startTime < r.endTime) ||
                  (formData.endTime > r.startTime && formData.endTime <= r.endTime) ||
                  (formData.startTime <= r.startTime && formData.endTime >= r.endTime)
                );
                const isSelected = selectedTable?._id === table._id;
                return (
                  <button
                    key={table._id}
                    onClick={() => !hasConflict && setSelectedTable(table)}
                    disabled={hasConflict}
                    className={`w-full card rounded-xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected 
                        ? 'border-[--primary] bg-[--primary]/10 scale-[1.02]' 
                        : hasConflict 
                          ? 'opacity-50 cursor-not-allowed hover:scale-100' 
                          : 'hover:border-[--primary]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-[--primary]/20' : 'bg-[--bg]'}`}>
                          <Armchair size={22} className={isSelected ? 'text-[--primary]' : 'text-zinc-500'} />
                        </div>
                        <div>
                          <p className="font-semibold text-[--text-primary]">{table.name}</p>
                          <p className="text-xs text-[--muted]">{table.zone?.name || 'Main Area'}</p>
                        </div>
                      </div>
                      {hasConflict ? (
                        <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">Booked</span>
                      ) : isSelected ? (
                        <div className="w-7 h-7 bg-[--primary] rounded-full flex items-center justify-center animate-scale-in">
                          <Check size={16} className="text-black" />
                        </div>
                      ) : (
                        <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg">Available</span>
                      )}
                    </div>
                    {tableRes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[--border]">
                        <p className="text-[10px] text-[--muted]">Other reservations: {tableRes.map((r, i) => `${r.startTime}-${r.endTime}`).join(', ')}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => goToStep(1)} className="flex-1 py-4 rounded-xl border border-[--border] text-[--muted] hover:bg-[--card] active:scale-[0.98] transition-all">
                Back
              </button>
              <button 
                onClick={() => selectedTable && goToStep(3)} 
                disabled={!selectedTable}
                className="flex-1 btn-primary py-4 rounded-xl font-semibold disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Your Details */}
        {step === 3 && (
          <div key="step3" className={`space-y-4 opacity-0 ${animationClass}`} style={{animationFillMode: 'forwards'}}>
            <div className="card rounded-xl p-4 mb-4">
              <p className="text-xs text-[--muted] mb-2">Your Reservation</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[--primary]/20 rounded-lg flex items-center justify-center">
                  <Armchair size={20} className="text-[--primary]" />
                </div>
                <div>
                  <p className="font-semibold text-[--text-primary]">{selectedTable?.name}</p>
                  <p className="text-xs text-[--muted]">{selectedDate} • {formData.startTime} - {formData.endTime}</p>
                </div>
              </div>
            </div>

            <div className="card rounded-xl p-4 space-y-4">
              <div>
                <label className="text-xs text-[--muted] mb-2 block">Your Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full bg-[--bg] border border-[--border] rounded-xl px-4 py-3 text-[--text-primary] transition-all focus:scale-[1.01]"
                />
              </div>
              <div>
                <label className="text-xs text-[--muted] mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full bg-[--bg] border border-[--border] rounded-xl px-4 py-3 text-[--text-primary] transition-all focus:scale-[1.01]"
                />
              </div>
              <div>
                <label className="text-xs text-[--muted] mb-2 block">Special Requests</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requests?"
                  rows={3}
                  className="w-full bg-[--bg] border border-[--border] rounded-xl px-4 py-3 text-[--text-primary] resize-none transition-all focus:scale-[1.01]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => goToStep(2)} className="flex-1 py-4 rounded-xl border border-[--border] text-[--muted] hover:bg-[--card] active:scale-[0.98] transition-all">
                Back
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 btn-primary py-4 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
