'use client';

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from 'next/link';
import StockBadge from './components/StockBadge';

export default function Dashboard() {
  const data = useQuery(api.inventory.list);
  const today = new Date().toISOString().split('T')[0];
  const wastage = useQuery(api.wastage.list, { date: today });
  const allWastage = useQuery(api.wastage.list, {});
  const deductions = useQuery(api.deductions.listByDate, {});
  const seed = useMutation(api.inventory.seed);

  useEffect(() => { seed(); }, []);

  // Calculate daily usage stats
  const usageStats = useMemo(() => {
    if (!deductions) return {};
    const last7Days = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const stats = {};
    
    deductions.filter(d => d.date >= last7Days).forEach(d => {
      if (!stats[d.itemId]) stats[d.itemId] = 0;
      stats[d.itemId] += d.quantity;
    });

    Object.keys(stats).forEach(id => {
      stats[id] = stats[id] / 7;
    });
    return stats;
  }, [deductions]);

  if (!data || !wastage || !allWastage || !deductions) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">LOADING...</div>;
  }

  const totalValue = data.items.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0);
  const lowStockItems = data.items.filter((item) => item.quantity <= item.minStock);
  const zeroStock = data.items.filter((item) => item.quantity === 0);
  const todayDeductions = deductions.filter(d => d.date === today);
  const todayUsage = todayDeductions.reduce((sum, d) => sum + d.totalCost, 0);

  return (
    <div className="p-6">
      <div className="mb-6 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">DASHBOARD</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest">System Overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <MetricCard label="TOTAL ITEMS" value={data.totalItems} />
        <MetricCard label="STOCK VALUE" value={`₹${totalValue.toLocaleString()}`} highlight="green" />
        <MetricCard label="TODAY USAGE" value={`₹${todayUsage.toLocaleString()}`} sub={`${todayDeductions.length} transactions`} />
        <MetricCard label="TODAY WASTAGE" value={`₹${wastage.totalLoss.toLocaleString()}`} highlight={wastage.totalLoss > 0 ? "red" : undefined} />
        <MetricCard label="LOW STOCK" value={lowStockItems.length} sub={`${zeroStock.length} zero stock`} highlight={lowStockItems.length > 0 ? "red" : "green"} />
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-zinc-900 border border-red-900/50 p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-red-500 uppercase tracking-wide">⚠ LOW STOCK ALERT</h2>
            <span className="text-xs text-zinc-600">{lowStockItems.length} items</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.slice(0, 6).map((item) => {
              const dailyUsage = usageStats[item._id] || 0;
              return (
              <Link href={`/item/${item._id}`} key={item._id} className="bg-zinc-950 p-3 flex justify-between items-center hover:bg-zinc-900 transition-colors">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-[10px] text-zinc-600 uppercase">{item.category} {dailyUsage > 0 && `• ${dailyUsage.toFixed(1)}/day`}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${item.quantity === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {item.quantity} {item.unit} <span className="font-normal text-zinc-500">(₹{(item.quantity * item.costPerUnit).toLocaleString()})</span>
                  </p>
                </div>
              </Link>
            )})}
          </div>
          {lowStockItems.length > 6 && (
            <Link href="/inventory" className="block mt-3 text-xs text-zinc-500 hover:text-white">
              View all {lowStockItems.length} items →
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/inventory" className="bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">▤ INVENTORY</p>
          <p className="font-bold">Manage Stock</p>
          <p className="text-xs text-zinc-600 mt-1">Add, edit, restock items</p>
        </Link>
        <Link href="/wastage" className="bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">✕ WASTAGE</p>
          <p className="font-bold">Log Wastage</p>
          <p className="text-xs text-zinc-600 mt-1">Record daily losses</p>
        </Link>
        <Link href="/reports" className="bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">▦ REPORTS</p>
          <p className="font-bold">View Reports</p>
          <p className="text-xs text-zinc-600 mt-1">Analyze consumption & loss</p>
        </Link>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, highlight }) {
  const colors = {
    green: 'border-l-emerald-500',
    red: 'border-l-red-500',
  };
  
  return (
    <div className={`bg-zinc-900 border border-zinc-800 p-4 ${highlight ? `border-l-4 ${colors[highlight]}` : ''}`}>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight === 'red' ? 'text-red-400' : highlight === 'green' ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
}
