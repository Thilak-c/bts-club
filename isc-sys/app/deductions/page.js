'use client';

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function DeductionsPage() {
  const inventory = useQuery(api.inventory.list);
  const deductionLog = useQuery(api.deductions.list);
  const deductStock = useMutation(api.inventory.deductStock);

  const [deductions, setDeductions] = useState([{ itemId: '', quantity: '' }]);
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!inventory || !deductionLog) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">LOADING...</div>;
  }

  function addRow() { setDeductions([...deductions, { itemId: '', quantity: '' }]); }
  function removeRow(i) { setDeductions(deductions.filter((_, idx) => idx !== i)); }
  function updateRow(i, field, value) {
    const updated = [...deductions];
    updated[i][field] = value;
    setDeductions(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const valid = deductions.filter(d => d.itemId && d.quantity);
    const data = await deductStock({
      orderId: orderId || `ORD-${Date.now()}`,
      deductions: valid.map(d => ({ itemId: d.itemId, quantity: Number(d.quantity) })),
    });
    setResult(data);
    setDeductions([{ itemId: '', quantity: '' }]);
    setOrderId('');
    setSubmitting(false);
  }

  const totalCost = deductionLog.reduce((sum, d) => sum + d.totalCost, 0);

  return (
    <div className="p-6">
      <div className="mb-6 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">DEDUCTIONS</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest">Stock Usage Recording</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deduction Form */}
        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-4">PROCESS DEDUCTION</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Order ID (Optional)</label>
              <input type="text" className="w-full px-3 py-2 text-sm" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="ORD-12345" />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide">Items to Deduct</label>
              {deductions.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <select className="flex-1 px-3 py-2 text-sm" value={d.itemId} onChange={e => updateRow(i, 'itemId', e.target.value)}>
                    <option value="">Select item...</option>
                    {inventory.items.map(item => (
                      <option key={item._id} value={item._id}>{item.name} ({item.quantity} {item.unit})</option>
                    ))}
                  </select>
                  <input type="number" className="w-20 px-3 py-2 text-sm" value={d.quantity} onChange={e => updateRow(i, 'quantity', e.target.value)} placeholder="Qty" min="0.1" step="0.1" />
                  {deductions.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)} className="text-red-500 px-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addRow} className="text-xs text-zinc-500 hover:text-white">+ Add item</button>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 text-xs font-bold uppercase tracking-wide hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'PROCESSING...' : 'DEDUCT STOCK'}
            </button>
          </form>

          {result && (
            <div className={`mt-4 p-3 text-sm ${result.success ? 'bg-emerald-950 border border-emerald-800' : 'bg-red-950 border border-red-800'}`}>
              {result.success ? (
                <>
                  <p className="text-emerald-400 font-bold">✓ Stock deducted</p>
                  {result.lowStockAlerts > 0 && <p className="text-amber-400 text-xs mt-1">⚠ {result.lowStockAlerts} item(s) now low</p>}
                </>
              ) : <p className="text-red-400">Failed to deduct</p>}
            </div>
          )}
        </div>

        {/* Log */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">DEDUCTION LOG</h2>
            <span className="text-xs text-zinc-600">Total: ₹{totalCost.toLocaleString()}</span>
          </div>
          {deductionLog.length === 0 ? (
            <p className="text-center py-8 text-zinc-600">No deductions yet</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 text-[10px] uppercase tracking-wide sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-4 text-zinc-500">Item</th>
                    <th className="text-right py-2 px-3 text-zinc-500">Used</th>
                    <th className="text-left py-2 px-4 text-zinc-500">Order</th>
                  </tr>
                </thead>
                <tbody>
                  {[...deductionLog].reverse().slice(0, 50).map((log) => (
                    <tr key={log._id} className="border-t border-zinc-800/50">
                      <td className="py-2 px-4 font-medium">{log.itemName}</td>
                      <td className="py-2 px-3 text-right">{log.quantity} {log.unit} <span className="text-zinc-500">(₹{log.totalCost})</span></td>
                      <td className="py-2 px-4 text-zinc-500 text-xs">{log.orderId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
