'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from 'next/link';
import Modal from '../components/Modal';
import StockBadge from '../components/StockBadge';

const categories = ['oils', 'dairy', 'meat', 'grains', 'vegetables', 'spices', 'other'];

export default function InventoryPage() {
  const data = useQuery(api.inventory.list);
  const allDeductions = useQuery(api.deductions.listByDate, {});
  const addItem = useMutation(api.inventory.add);
  const restockItem = useMutation(api.inventory.restock);
  const removeItem = useMutation(api.inventory.remove);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ name: '', unit: 'kg', quantity: '', minStock: '', costPerUnit: '', category: 'other' });
  const [restockQty, setRestockQty] = useState('');

  // Calculate usage stats for all items
  const usageStats = useMemo(() => {
    if (!allDeductions) return {};
    const last7Days = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const stats = {};
    
    allDeductions.filter(d => d.date >= last7Days).forEach(d => {
      if (!stats[d.itemId]) stats[d.itemId] = 0;
      stats[d.itemId] += d.quantity;
    });

    // Convert to daily average
    Object.keys(stats).forEach(id => {
      stats[id] = stats[id] / 7;
    });
    return stats;
  }, [allDeductions]);

  // Calculate restock suggestions based on 7-day usage
  const restockSuggestions = useMemo(() => {
    if (!data?.items || !allDeductions) return [];

    return data.items
      .map(item => {
        const dailyUsage = usageStats[item._id] || 0;
        const daysLeft = dailyUsage > 0 ? item.quantity / dailyUsage : 999;
        const targetStock = dailyUsage * 14;
        const suggestedQty = Math.max(0, Math.ceil(targetStock - item.quantity));
        const suggestedCost = suggestedQty * item.costPerUnit;
        
        return {
          ...item,
          dailyUsage,
          daysLeft,
          suggestedQty,
          suggestedCost,
          needsRestock: item.quantity <= item.minStock || daysLeft <= 7,
        };
      })
      .filter(i => i.needsRestock && i.suggestedQty > 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [data, allDeductions, usageStats]);

  const totalRestockCost = restockSuggestions.reduce((sum, i) => sum + i.suggestedCost, 0);

  if (!data) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">LOADING...</div>;

  const filteredItems = filter === 'all' ? data.items
    : filter === 'low' ? data.items.filter(i => i.quantity <= i.minStock)
    : data.items.filter(i => i.category === filter);

  const totalValue = filteredItems.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0);

  async function handleAddItem(e) {
    e.preventDefault();
    await addItem({
      name: form.name, unit: form.unit, quantity: Number(form.quantity),
      minStock: Number(form.minStock), costPerUnit: Number(form.costPerUnit), category: form.category,
    });
    setShowAddModal(false);
    setForm({ name: '', unit: 'kg', quantity: '', minStock: '', costPerUnit: '', category: 'other' });
  }

  async function handleRestock(e) {
    e.preventDefault();
    await restockItem({ id: selectedItem._id, quantity: Number(restockQty) });
    setShowRestockModal(false);
    setRestockQty('');
    setSelectedItem(null);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return;
    await removeItem({ id });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">INVENTORY</h1>
          <p className="text-zinc-600 text-xs uppercase tracking-widest">Raw Item Management</p>
        </div>
        <div className="flex gap-2">
          {restockSuggestions.length > 0 && (
            <button onClick={() => setShowSuggestionsModal(true)} className="bg-amber-600 text-black px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-amber-500">
              RESTOCK LIST ({restockSuggestions.length})
            </button>
          )}
          <button onClick={() => setShowAddModal(true)} className="bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-zinc-200">
            + ADD ITEM
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'low', ...categories].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs uppercase tracking-wide ${filter === f ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
          >
            {f === 'low' ? 'LOW STOCK' : f}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="flex gap-6 mb-4 text-xs text-zinc-500">
        <span>{filteredItems.length} items</span>
        <span>Value: ₹{totalValue.toLocaleString()}</span>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-[10px] uppercase tracking-wide">
            <tr>
              <th className="text-left py-3 px-4 text-zinc-500">Item</th>
              <th className="text-left py-3 px-3 text-zinc-500">Category</th>
              <th className="text-right py-3 px-3 text-zinc-500">Stock</th>
              <th className="text-right py-3 px-3 text-zinc-500">Avg/Day</th>
              <th className="text-center py-3 px-3 text-zinc-500">Status</th>
              <th className="text-right py-3 px-4 text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const dailyUsage = usageStats[item._id] || 0;
              return (
              <tr key={item._id} className="border-t border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="py-3 px-4">
                  <Link href={`/item/${item._id}`} className="font-medium hover:text-blue-400 transition-colors">{item.name}</Link>
                </td>
                <td className="py-3 px-3 text-zinc-500 uppercase text-xs">{item.category}</td>
                <td className="py-3 px-3 text-right">{item.quantity} {item.unit} <span className="text-zinc-500">(₹{(item.quantity * item.costPerUnit).toLocaleString()})</span></td>
                <td className="py-3 px-3 text-right text-zinc-400">{dailyUsage > 0 ? `${dailyUsage.toFixed(1)}/day` : '-'}</td>
                <td className="py-3 px-3 text-center"><StockBadge quantity={item.quantity} minStock={item.minStock} /></td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => { setSelectedItem(item); setShowRestockModal(true); }} className="text-xs text-zinc-500 hover:text-white mr-3">RESTOCK</button>
                  <button onClick={() => handleDelete(item._id)} className="text-xs text-red-500 hover:text-red-400">DELETE</button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        {filteredItems.length === 0 && <p className="text-center py-8 text-zinc-600">No items found</p>}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Item">
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Item Name</label>
            <input type="text" className="w-full px-3 py-2 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Unit</label>
              <select className="w-full px-3 py-2 text-sm" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                <option value="kg">kg</option>
                <option value="liters">liters</option>
                <option value="pieces">pieces</option>
                <option value="packets">packets</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Category</label>
              <select className="w-full px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Quantity</label>
              <input type="number" className="w-full px-3 py-2 text-sm" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Min Stock</label>
              <input type="number" className="w-full px-3 py-2 text-sm" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} required min="0" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Rate (₹)</label>
              <input type="number" className="w-full px-3 py-2 text-sm" value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: e.target.value })} required min="0" />
            </div>
          </div>
          <button type="submit" className="w-full bg-white text-black py-2 text-xs font-bold uppercase tracking-wide hover:bg-zinc-200">Add Item</button>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal isOpen={showRestockModal} onClose={() => setShowRestockModal(false)} title={`Restock ${selectedItem?.name}`}>
        <form onSubmit={handleRestock} className="space-y-4">
          <p className="text-sm text-zinc-500">Current: {selectedItem?.quantity} {selectedItem?.unit}</p>
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Add Quantity</label>
            <input type="number" className="w-full px-3 py-2 text-sm" value={restockQty} onChange={e => setRestockQty(e.target.value)} required min="1" />
          </div>
          <button type="submit" className="w-full bg-white text-black py-2 text-xs font-bold uppercase tracking-wide hover:bg-zinc-200">Restock</button>
        </form>
      </Modal>

      {/* Restock Suggestions Modal */}
      <Modal isOpen={showSuggestionsModal} onClose={() => setShowSuggestionsModal(false)} title="Smart Restock Suggestions">
        <div className="space-y-4">
          <div className="bg-zinc-950 p-3 border border-zinc-800 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">TOTAL RESTOCK COST</p>
              <p className="text-xl font-bold text-amber-400">₹{totalRestockCost.toLocaleString()}</p>
            </div>
            <p className="text-[10px] text-zinc-600">Based on 14-day target stock</p>
          </div>
          
          <div className="max-h-80 overflow-y-auto space-y-2">
            {restockSuggestions.map(item => (
              <div key={item._id} className="bg-zinc-950 p-3 border border-zinc-800 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-[10px] text-zinc-600">
                    Current: {item.quantity} {item.unit} • 
                    {item.daysLeft < 999 ? ` ${item.daysLeft.toFixed(0)} days left` : ' No usage data'} •
                    {item.dailyUsage > 0 ? ` ${item.dailyUsage.toFixed(1)}/day avg` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-400">+{item.suggestedQty} {item.unit}</p>
                  <p className="text-[10px] text-zinc-500">₹{item.suggestedCost.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {restockSuggestions.length === 0 && (
            <p className="text-center py-4 text-zinc-600">All items adequately stocked!</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
