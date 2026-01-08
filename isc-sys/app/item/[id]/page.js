'use client';

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = params.id;

  const inventory = useQuery(api.inventory.list);
  const allDeductions = useQuery(api.deductions.listByDate, {});
  const allWastage = useQuery(api.wastage.list, {});

  if (!inventory || !allDeductions || !allWastage) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">LOADING...</div>;
  }

  const item = inventory.items.find(i => i._id === itemId);
  if (!item) {
    return (
      <div className="p-6">
        <p className="text-red-400">Item not found</p>
        <Link href="/inventory" className="text-zinc-500 hover:text-white text-sm mt-2 inline-block">← Back to Inventory</Link>
      </div>
    );
  }

  // Filter data for this item
  const itemDeductions = allDeductions.filter(d => d.itemId === itemId);
  const itemWastage = allWastage.entries.filter(w => w.itemId === itemId);

  // Calculate stats
  const totalUsed = itemDeductions.reduce((sum, d) => sum + d.quantity, 0);
  const totalWasted = itemWastage.reduce((sum, w) => sum + w.quantity, 0);
  const totalUsageCost = itemDeductions.reduce((sum, d) => sum + d.totalCost, 0);
  const totalWastageCost = itemWastage.reduce((sum, w) => sum + w.costLoss, 0);
  const currentValue = item.quantity * item.costPerUnit;

  // Daily usage for last 30 days
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const dayUsed = itemDeductions.filter(d => d.date === date).reduce((sum, d) => sum + d.quantity, 0);
    const dayWasted = itemWastage.filter(w => w.date === date).reduce((sum, w) => sum + w.quantity, 0);
    last30Days.push({ date, used: dayUsed, wasted: dayWasted });
  }

  // Last 7 days for chart
  const last7Days = last30Days.slice(-7);
  const avgDailyUsage = totalUsed / 30;
  const daysUntilEmpty = avgDailyUsage > 0 ? item.quantity / avgDailyUsage : 999;

  // Wastage by reason
  const wastageByReason = {};
  itemWastage.forEach(w => {
    if (!wastageByReason[w.reason]) wastageByReason[w.reason] = 0;
    wastageByReason[w.reason] += w.costLoss;
  });

  // Usage distribution (pie chart data)
  const totalMovement = totalUsed + totalWasted;
  const usagePercent = totalMovement > 0 ? (totalUsed / totalMovement * 100).toFixed(1) : 100;
  const wastagePercent = totalMovement > 0 ? (totalWasted / totalMovement * 100).toFixed(1) : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 border-b border-zinc-800 pb-4">
        <Link href="/inventory" className="text-zinc-600 hover:text-zinc-400 text-xs uppercase tracking-wide mb-2 inline-block">
          ← BACK TO INVENTORY
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{item.name}</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">{item.category} • {item.unit}</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${item.quantity <= item.minStock ? item.quantity === 0 ? 'text-red-400' : 'text-amber-400' : 'text-white'}`}>
              {item.quantity} {item.unit} <span className="text-lg text-zinc-500">(₹{currentValue.toLocaleString()})</span>
            </p>
            <p className="text-zinc-600 text-xs">{daysUntilEmpty < 999 ? `~${daysUntilEmpty.toFixed(0)} days left` : 'Stock OK'}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <MetricCard label="CURRENT STOCK" value={`${item.quantity} ${item.unit}`} sub={`₹${currentValue.toLocaleString()}`} />
        <MetricCard label="RATE" value={`₹${item.costPerUnit}/${item.unit}`} />
        <MetricCard label="MIN STOCK" value={`${item.minStock} ${item.unit}`} />
        <MetricCard label="TOTAL USED" value={`${totalUsed.toFixed(1)} ${item.unit}`} sub={`₹${totalUsageCost.toLocaleString()}`} />
        <MetricCard label="TOTAL WASTED" value={`${totalWasted.toFixed(1)} ${item.unit}`} sub={`₹${totalWastageCost.toLocaleString()}`} danger={totalWasted > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pie Chart - Usage vs Wastage */}
        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-4">USAGE DISTRIBUTION</h2>
          <PieChart used={Number(usagePercent)} wasted={Number(wastagePercent)} />
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500" />
              <span className="text-zinc-400">Used ({usagePercent}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500" />
              <span className="text-zinc-400">Wasted ({wastagePercent}%)</span>
            </div>
          </div>
          {totalMovement === 0 && <p className="text-center text-zinc-600 text-xs mt-4">No movement recorded</p>}
        </div>

        {/* 7 Day Usage Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-4">LAST 7 DAYS</h2>
          <BarChart data={last7Days} />
        </div>

        {/* Wastage by Reason */}
        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-4">WASTAGE BY REASON</h2>
          {Object.keys(wastageByReason).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-emerald-400 font-bold">NO WASTAGE</p>
              <p className="text-zinc-600 text-xs mt-1">This item has no recorded wastage</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(wastageByReason).sort((a, b) => b[1] - a[1]).map(([reason, cost]) => (
                <div key={reason} className="flex justify-between items-center p-2 bg-zinc-950">
                  <span className="text-sm">{reason}</span>
                  <span className="text-red-400 font-bold">₹{cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 30 Day Trend */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 mb-6">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-4">30 DAY MOVEMENT TREND</h2>
        <TrendChart data={last30Days} />
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Usage */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">RECENT USAGE</h2>
            <span className="text-xs text-zinc-600">{itemDeductions.length} records</span>
          </div>
          <TransactionList transactions={itemDeductions.slice(-20).reverse()} type="usage" unit={item.unit} />
        </div>

        {/* Recent Wastage */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">RECENT WASTAGE</h2>
            <span className="text-xs text-zinc-600">{itemWastage.length} records</span>
          </div>
          <TransactionList transactions={itemWastage.slice(-20).reverse()} type="wastage" unit={item.unit} />
        </div>
      </div>
    </div>
  );
}


function MetricCard({ label, value, sub, danger }) {
  return (
    <div className={`bg-zinc-900 border p-4 ${danger ? 'border-red-900' : 'border-zinc-800'}`}>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-lg font-bold ${danger ? 'text-red-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
}

function PieChart({ used, wasted }) {
  const total = used + wasted;
  if (total === 0) {
    return (
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-600 text-xs">NO DATA</span>
        </div>
      </div>
    );
  }

  const usedDeg = (used / 100) * 360;
  
  return (
    <div className="flex justify-center">
      <div 
        className="w-32 h-32 rounded-full relative"
        style={{
          background: `conic-gradient(#3b82f6 0deg ${usedDeg}deg, #ef4444 ${usedDeg}deg 360deg)`
        }}
      >
        <div className="absolute inset-4 bg-zinc-900 rounded-full flex items-center justify-center flex-col">
          <span className="text-lg font-bold">{used}%</span>
          <span className="text-[10px] text-zinc-500">USED</span>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.used + d.wasted), 1);
  
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((day, i) => {
        const usedHeight = (day.used / maxVal) * 100;
        const wastedHeight = (day.wasted / maxVal) * 100;
        const isToday = i === data.length - 1;
        
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col justify-end h-24">
              {(day.used > 0 || day.wasted > 0) ? (
                <div className="flex flex-col-reverse">
                  {day.used > 0 && (
                    <div className={`w-full ${isToday ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ height: `${Math.max(usedHeight, 4)}%` }} />
                  )}
                  {day.wasted > 0 && (
                    <div className="w-full bg-red-500" style={{ height: `${Math.max(wastedHeight, 4)}%` }} />
                  )}
                </div>
              ) : (
                <div className="w-full bg-zinc-800 h-1" />
              )}
            </div>
            <div className={`text-[9px] mt-1 ${isToday ? 'text-white font-bold' : 'text-zinc-600'}`}>
              {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' }).charAt(0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.used + d.wasted), 1);
  
  return (
    <div className="flex items-end gap-0.5 h-24">
      {data.map((day, i) => {
        const total = day.used + day.wasted;
        const height = (total / maxVal) * 100;
        const hasWastage = day.wasted > 0;
        
        return (
          <div 
            key={day.date} 
            className={`flex-1 ${hasWastage ? 'bg-red-600' : total > 0 ? 'bg-blue-600' : 'bg-zinc-800'}`}
            style={{ height: `${Math.max(height, 2)}%` }}
            title={`${day.date}: Used ${day.used}, Wasted ${day.wasted}`}
          />
        );
      })}
    </div>
  );
}

function TransactionList({ transactions, type, unit }) {
  if (transactions.length === 0) {
    return <p className="text-center py-8 text-zinc-600 text-sm">No {type} records</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-950 text-[10px] uppercase tracking-wide sticky top-0">
          <tr>
            <th className="text-left py-2 px-4 text-zinc-500">Date</th>
            <th className="text-right py-2 px-3 text-zinc-500">Amount</th>
            <th className="text-left py-2 px-4 text-zinc-500">Ref</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => (
            <tr key={i} className="border-t border-zinc-800/50">
              <td className="py-2 px-4 text-zinc-400">{t.date}</td>
              <td className="py-2 px-3 text-right">{t.quantity} {unit} <span className="text-zinc-500">(₹{(type === 'wastage' ? t.costLoss : t.totalCost).toLocaleString()})</span></td>
              <td className="py-2 px-4 text-zinc-600 text-xs">{type === 'wastage' ? t.reason : t.orderId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
