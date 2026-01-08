'use client';

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const reasons = ['Expired', 'Spoiled', 'Damaged', 'Overcooked', 'Dropped', 'Theft', 'Other'];

export default function WastagePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ itemId: '', quantity: '', reason: 'Spoiled' });
  const [submitting, setSubmitting] = useState(false);

  const inventory = useQuery(api.inventory.list);
  const wastage = useQuery(api.wastage.list, { date: selectedDate });
  const allWastage = useQuery(api.wastage.list, {});
  const addWastage = useMutation(api.wastage.add);

  if (!inventory || !wastage || !allWastage) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">LOADING...</div>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await addWastage({ itemId: form.itemId, quantity: Number(form.quantity), reason: form.reason, date: selectedDate });
    setForm({ itemId: '', quantity: '', reason: 'Spoiled' });
    setSubmitting(false);
  }

  return (
    <div className="p-6">
      <div className="mb-6 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">WASTAGE</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest">Daily Loss Recording</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-4">LOG WASTAGE</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Date</label>
              <input type="date" className="w-full px-3 py-2 text-sm" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Item</label>
              <select className="w-full px-3 py-2 text-sm" value={form.itemId} onChange={e => setForm({ ...form, itemId: e.target.value })} required>
                <option value="">Select item...</option>
                {inventory.items.map(item => (
                  <option key={item._id} value={item._id}>{item.name} ({item.quantity} {item.unit})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Quantity Wasted</label>
              <input type="number" className="w-full px-3 py-2 text-sm" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0.1" step="0.1" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Reason</label>
              <select className="w-full px-3 py-2 text-sm" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}>
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-red-600 text-white py-2 text-xs font-bold uppercase tracking-wide hover:bg-red-700 disabled:opacity-50">
              {submitting ? 'LOGGING...' : 'LOG WASTAGE'}
            </button>
          </form>
        </div>

        {/* Day Summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 border border-red-900/50 p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">TODAY'S LOSS</p>
              <p className="text-2xl font-bold text-red-400">₹{wastage.totalLoss.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">ENTRIES</p>
              <p className="text-2xl font-bold">{wastage.count}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">ALL TIME LOSS</p>
              <p className="text-2xl font-bold text-red-400">₹{allWastage.totalLoss.toLocaleString()}</p>
            </div>
          </div>

          {/* Log */}
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">WASTAGE LOG - {selectedDate}</h2>
            </div>
            {wastage.entries.length === 0 ? (
              <p className="text-center py-8 text-zinc-600">No wastage recorded for this date</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-[10px] uppercase tracking-wide">
                  <tr>
                    <th className="text-left py-2 px-4 text-zinc-500">Item</th>
                    <th className="text-left py-2 px-3 text-zinc-500">Reason</th>
                    <th className="text-right py-2 px-4 text-zinc-500">Wasted</th>
                  </tr>
                </thead>
                <tbody>
                  {wastage.entries.map(entry => (
                    <tr key={entry._id} className="border-t border-zinc-800/50">
                      <td className="py-3 px-4 font-medium">{entry.itemName}</td>
                      <td className="py-3 px-3 text-zinc-500">{entry.reason}</td>
                      <td className="py-3 px-4 text-right font-bold text-red-400">{entry.quantity} <span className="text-zinc-500 font-normal">(₹{entry.costLoss.toLocaleString()})</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
