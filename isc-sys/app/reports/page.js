'use client';

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const inventory = useQuery(api.inventory.list);
  const allDeductions = useQuery(api.deductions.listByDate, {});
  const allWastage = useQuery(api.wastage.list, {});

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const weekStart = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const dateFilters = useMemo(() => {
    switch (dateRange) {
      case 'today': return { start: today, end: today, label: 'Today' };
      case 'yesterday': return { start: yesterday, end: yesterday, label: 'Yesterday' };
      case 'week': return { start: weekStart, end: today, label: 'This Week' };
      case 'month': return { start: monthStart, end: today, label: 'This Month' };
      case 'custom': return { start: customStart || today, end: customEnd || today, label: 'Custom' };
      default: return { start: today, end: today, label: 'Today' };
    }
  }, [dateRange, customStart, customEnd, today, yesterday, weekStart, monthStart]);

  if (!inventory || !allDeductions || !allWastage) {
    return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-mono">LOADING DATA...</div>;
  }

  // Filter data by date range
  const deductions = allDeductions.filter(d => d.date >= dateFilters.start && d.date <= dateFilters.end);
  const wastage = allWastage.entries.filter(w => w.date >= dateFilters.start && w.date <= dateFilters.end);
  const monthWastage = allWastage.entries.filter(w => w.date >= monthStart);

  // HARD NUMBERS
  const totalStockValue = inventory.items.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0);
  const consumedToday = deductions.reduce((sum, d) => sum + d.totalCost, 0);
  const wastedToday = wastage.reduce((sum, w) => sum + w.costLoss, 0);
  const monthlyWastageLoss = monthWastage.reduce((sum, w) => sum + w.costLoss, 0);
  const lowStockItems = inventory.items.filter(i => i.quantity <= i.minStock);
  const zeroStockItems = inventory.items.filter(i => i.quantity === 0);

  // Calculate avg daily usage (7-day)
  const last7Days = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const usageStats = {};
  allDeductions.filter(d => d.date >= last7Days).forEach(d => {
    if (!usageStats[d.itemId]) usageStats[d.itemId] = 0;
    usageStats[d.itemId] += d.quantity;
  });
  Object.keys(usageStats).forEach(id => { usageStats[id] = usageStats[id] / 7; });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-mono">
      {/* Header */}
      <div className="mb-6 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">RAW ITEM MANAGER</h1>
        <p className="text-zinc-500 text-sm">Where is your money going?</p>
      </div>

      {/* Date Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['today', 'yesterday', 'week', 'month', 'custom'].map(f => (
          <button
            key={f}
            onClick={() => setDateRange(f)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wide ${dateRange === f ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f}
          </button>
        ))}
        {dateRange === 'custom' && (
          <div className="flex gap-2 items-center ml-2">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs" />
            <span className="text-zinc-600">→</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs" />
          </div>
        )}
      </div>

      {/* HARD SUMMARY - THE PAIN */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <HardNumber label="STOCK VALUE" value={totalStockValue} prefix="₹" />
        <HardNumber label="CONSUMED" value={consumedToday} prefix="₹" sub={dateFilters.label} />
        <HardNumber label="WASTED" value={wastedToday} prefix="₹" sub={dateFilters.label} danger={wastedToday > 0} />
        <HardNumber label="MONTHLY LOSS" value={monthlyWastageLoss} prefix="₹" sub="Wastage" danger />
        <HardNumber label="AT RISK" value={lowStockItems.length} sub={`${zeroStockItems.length} ZERO STOCK`} danger={lowStockItems.length > 0} />
      </div>

      {/* WASTAGE CRIME SCENE */}
      <WastageCrimeScene wastage={wastage} monthWastage={monthWastage} deductions={deductions} />

      {/* THE TRUTH TABLE */}
      <TruthTable items={inventory.items} deductions={deductions} wastage={wastage} usageStats={usageStats} />

      {/* LOW STOCK DANGER */}
      <LowStockDanger items={inventory.items} deductions={allDeductions} />

      {/* MOVEMENT HISTORY */}
      <MovementHistory deductions={deductions} wastage={wastage} />
    </div>
  );
}


function HardNumber({ label, value, prefix = '', sub, danger }) {
  return (
    <div className={`p-4 ${danger ? 'bg-red-950 border border-red-900' : 'bg-zinc-900 border border-zinc-800'}`}>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold ${danger ? 'text-red-400' : 'text-white'}`}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
}

function WastageCrimeScene({ wastage, monthWastage, deductions }) {
  const totalWasted = wastage.reduce((sum, w) => sum + w.costLoss, 0);
  const totalUsed = deductions.reduce((sum, d) => sum + d.totalCost, 0);
  const wastagePercent = (totalUsed + totalWasted) > 0 ? ((totalWasted / (totalUsed + totalWasted)) * 100).toFixed(1) : 0;
  
  // Monthly projection
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysPassed = new Date().getDate();
  const monthlyWastage = monthWastage.reduce((sum, w) => sum + w.costLoss, 0);
  const projectedMonthlyLoss = daysPassed > 0 ? (monthlyWastage / daysPassed) * daysInMonth : 0;
  
  // Top wasted items
  const byItem = {};
  wastage.forEach(w => {
    if (!byItem[w.itemName]) byItem[w.itemName] = { name: w.itemName, cost: 0, qty: 0 };
    byItem[w.itemName].cost += w.costLoss;
    byItem[w.itemName].qty += w.quantity;
  });
  const topWasted = Object.values(byItem).sort((a, b) => b.cost - a.cost).slice(0, 5);

  // By reason
  const byReason = {};
  wastage.forEach(w => {
    if (!byReason[w.reason]) byReason[w.reason] = 0;
    byReason[w.reason] += w.costLoss;
  });

  if (totalWasted === 0 && topWasted.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 mb-6">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-4">WASTAGE REPORT</h2>
        <p className="text-zinc-500">No wastage recorded for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-red-900/50 p-6 mb-6">
      <h2 className="text-sm font-bold text-red-500 uppercase tracking-wide mb-4">⚠ WASTAGE CRIME SCENE</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase">WASTAGE VS USAGE</p>
            <p className="text-3xl font-bold text-red-400">{wastagePercent}%</p>
            <p className="text-xs text-zinc-600">of total consumption is waste</p>
          </div>
          
          <div className="bg-zinc-950 p-3">
            <p className="text-[10px] text-zinc-500 uppercase mb-1">IF WASTAGE WAS CONTROLLED</p>
            <p className="text-lg font-bold text-emerald-400">You'd save ₹{projectedMonthlyLoss.toLocaleString()}/month</p>
          </div>

          {Object.keys(byReason).length > 0 && (
            <div>
              <p className="text-[10px] text-zinc-500 uppercase mb-2">LOSS BY REASON</p>
              {Object.entries(byReason).sort((a, b) => b[1] - a[1]).map(([reason, cost]) => (
                <div key={reason} className="flex justify-between text-sm py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">{reason}</span>
                  <span className="text-red-400 font-medium">₹{cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle: Top Wasted */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase mb-3">TOP 5 MONEY BURNERS</p>
          {topWasted.length === 0 ? (
            <p className="text-zinc-600 text-sm">No data</p>
          ) : (
            <div className="space-y-2">
              {topWasted.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 bg-zinc-950 p-2">
                  <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-[10px] text-zinc-600">{item.qty.toFixed(2)} units wasted</p>
                  </div>
                  <p className="text-red-400 font-bold">₹{item.cost.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Visual */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase mb-3">USED VS WASTED (₹)</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Used</span>
                <span>₹{totalUsed.toLocaleString()}</span>
              </div>
              <div className="h-6 bg-zinc-800">
                <div className="h-full bg-blue-600" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">Wasted</span>
                <span className="text-red-400">₹{totalWasted.toLocaleString()}</span>
              </div>
              <div className="h-6 bg-zinc-800">
                <div className="h-full bg-red-600" style={{ width: `${totalUsed > 0 ? (totalWasted / totalUsed) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function TruthTable({ items, deductions, wastage, usageStats }) {
  const itemStats = useMemo(() => {
    const stats = {};
    
    items.forEach(item => {
      stats[item._id] = {
        id: item._id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        costPerUnit: item.costPerUnit,
        closingStock: item.quantity,
        openingStock: item.quantity,
        purchased: 0,
        used: 0,
        wasted: 0,
        avgDaily: usageStats[item._id] || 0,
      };
    });

    deductions.forEach(d => {
      if (stats[d.itemId]) {
        stats[d.itemId].used += d.quantity;
        stats[d.itemId].openingStock += d.quantity;
      }
    });

    wastage.forEach(w => {
      if (stats[w.itemId]) {
        stats[w.itemId].wasted += w.quantity;
        stats[w.itemId].openingStock += w.quantity;
      }
    });

    return Object.values(stats)
      .map(s => ({
        ...s,
        moneyBurned: (s.used + s.wasted) * s.costPerUnit,
        wastageCost: s.wasted * s.costPerUnit,
      }))
      .sort((a, b) => b.wastageCost - a.wastageCost || b.moneyBurned - a.moneyBurned);
  }, [items, deductions, wastage, usageStats]);

  const totalMoneyBurned = itemStats.reduce((sum, i) => sum + i.moneyBurned, 0);
  const totalWastageCost = itemStats.reduce((sum, i) => sum + i.wastageCost, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 mb-6 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide">THE TRUTH TABLE</h2>
        <p className="text-xs text-zinc-600">Sorted by highest loss</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-[10px] uppercase tracking-wide">
            <tr>
              <th className="text-left py-3 px-4 text-zinc-500">Item</th>
              <th className="text-right py-3 px-3 text-zinc-500">Avg/Day</th>
              <th className="text-right py-3 px-3 text-zinc-500">Used</th>
              <th className="text-right py-3 px-3 text-zinc-500">Wasted</th>
              <th className="text-right py-3 px-4 text-zinc-500">Closing</th>
            </tr>
          </thead>
          <tbody>
            {itemStats.filter(i => i.used > 0 || i.wasted > 0).map((item) => (
              <tr key={item.id} className="border-t border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="py-3 px-4">
                  <Link href={`/item/${item.id}`} className="hover:text-blue-400 transition-colors">
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-[10px] text-zinc-600 uppercase">{item.category}</p>
                  </Link>
                </td>
                <td className="py-3 px-3 text-right text-zinc-400">{item.avgDaily > 0 ? `${item.avgDaily.toFixed(1)}/day` : '-'}</td>
                <td className="py-3 px-3 text-right">{item.used > 0 ? `${item.used.toFixed(2)} ${item.unit}` : '-'} {item.used > 0 && <span className="text-zinc-500">(₹{(item.used * item.costPerUnit).toLocaleString()})</span>}</td>
                <td className="py-3 px-3 text-right">
                  {item.wasted > 0 ? (
                    <span className="text-red-400 font-bold bg-red-950 px-2 py-0.5">{item.wasted.toFixed(2)} {item.unit} <span className="font-normal">(₹{item.wastageCost.toLocaleString()})</span></span>
                  ) : '-'}
                </td>
                <td className="py-3 px-4 text-right font-medium">{item.closingStock.toFixed(1)} {item.unit} <span className="text-zinc-500">(₹{(item.closingStock * item.costPerUnit).toLocaleString()})</span></td>
              </tr>
            ))}
            {itemStats.filter(i => i.used > 0 || i.wasted > 0).length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-zinc-600">No consumption data for this period</td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-zinc-950 font-bold">
            <tr>
              <td colSpan="4" className="py-3 px-4 text-right text-zinc-400">TOTAL CONSUMED:</td>
              <td className="py-3 px-4 text-right">
                <span className="text-white">₹{totalMoneyBurned.toLocaleString()}</span>
                {totalWastageCost > 0 && (
                  <span className="text-red-400 text-xs ml-1">(₹{totalWastageCost.toLocaleString()} wasted)</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}


function LowStockDanger({ items, deductions }) {
  // Calculate daily usage rate
  const usageByItem = {};
  const last7Days = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  
  deductions.filter(d => d.date >= last7Days).forEach(d => {
    if (!usageByItem[d.itemId]) usageByItem[d.itemId] = 0;
    usageByItem[d.itemId] += d.quantity;
  });

  const dangerItems = items
    .filter(i => i.quantity <= i.minStock)
    .map(item => {
      const weeklyUsage = usageByItem[item._id] || 0;
      const dailyUsage = weeklyUsage / 7;
      const daysLeft = dailyUsage > 0 ? item.quantity / dailyUsage : 999;
      const reorderQty = Math.max(item.minStock * 2 - item.quantity, item.minStock);
      const reorderCost = reorderQty * item.costPerUnit;
      
      return {
        ...item,
        dailyUsage,
        daysLeft,
        reorderQty,
        reorderCost,
        isZero: item.quantity === 0,
        isCritical: daysLeft <= 2,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const totalReorderCost = dangerItems.reduce((sum, i) => sum + i.reorderCost, 0);

  if (dangerItems.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 mb-6">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-2">STOCK STATUS</h2>
        <p className="text-emerald-400">All items adequately stocked. No immediate action required.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-amber-900/50 p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wide">⚠ LOW STOCK DANGER</h2>
          <p className="text-xs text-zinc-600">{dangerItems.length} items need attention</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase">REORDER COST</p>
          <p className="text-xl font-bold text-amber-400">₹{totalReorderCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wide border-b border-zinc-800">
            <tr>
              <th className="text-left py-2 text-zinc-500">Item</th>
              <th className="text-right py-2 text-zinc-500">Current</th>
              <th className="text-right py-2 text-zinc-500">Min</th>
              <th className="text-right py-2 text-zinc-500">Daily Usage</th>
              <th className="text-right py-2 text-zinc-500">Days Left</th>
              <th className="text-right py-2 text-zinc-500">Reorder</th>
            </tr>
          </thead>
          <tbody>
            {dangerItems.map(item => (
              <tr key={item._id} className={`border-t border-zinc-800/50 ${item.isZero ? 'bg-red-950/30' : item.isCritical ? 'bg-amber-950/20' : ''}`}>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {item.isZero && <span className="text-[10px] bg-red-600 text-white px-1 font-bold">ZERO</span>}
                    {!item.isZero && item.isCritical && <span className="text-[10px] bg-amber-600 text-black px-1 font-bold">CRITICAL</span>}
                    <Link href={`/item/${item._id}`} className="font-medium hover:text-blue-400 transition-colors">{item.name}</Link>
                  </div>
                </td>
                <td className={`py-3 text-right font-bold ${item.isZero ? 'text-red-400' : 'text-amber-400'}`}>
                  {item.quantity} {item.unit} <span className="font-normal text-zinc-500">(₹{(item.quantity * item.costPerUnit).toLocaleString()})</span>
                </td>
                <td className="py-3 text-right text-zinc-500">{item.minStock}</td>
                <td className="py-3 text-right text-zinc-400">{item.dailyUsage.toFixed(2)}/day</td>
                <td className={`py-3 text-right font-bold ${item.daysLeft <= 1 ? 'text-red-400' : item.daysLeft <= 2 ? 'text-amber-400' : 'text-zinc-300'}`}>
                  {item.daysLeft < 999 ? `${item.daysLeft.toFixed(1)} days` : '-'}
                </td>
                <td className="py-3 text-right">{item.reorderQty} {item.unit} <span className="text-zinc-500">(₹{item.reorderCost.toLocaleString()})</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function MovementHistory({ deductions, wastage }) {
  const [expanded, setExpanded] = useState(false);
  
  const movements = useMemo(() => {
    const all = [];
    
    deductions.forEach(d => {
      all.push({
        id: d._id,
        type: 'USED',
        date: d.date,
        time: d.time,
        timestamp: d._creationTime,
        item: d.itemName,
        itemId: d.itemId,
        qty: d.quantity,
        unit: d.unit,
        cost: d.totalCost,
        ref: d.orderId,
      });
    });
    
    wastage.forEach(w => {
      all.push({
        id: w._id,
        type: 'WASTED',
        date: w.date,
        time: new Date(w._creationTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: w._creationTime,
        item: w.itemName,
        itemId: w.itemId,
        qty: w.quantity,
        unit: '',
        cost: w.costLoss,
        ref: w.reason,
      });
    });

    return all.sort((a, b) => b.timestamp - a.timestamp);
  }, [deductions, wastage]);

  const displayMovements = expanded ? movements : movements.slice(0, 10);

  if (movements.length === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide">MOVEMENT LOG</h2>
        <p className="text-xs text-zinc-600">{movements.length} records</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-[10px] uppercase tracking-wide">
            <tr>
              <th className="text-left py-2 px-4 text-zinc-500">Date/Time</th>
              <th className="text-left py-2 px-3 text-zinc-500">Type</th>
              <th className="text-left py-2 px-3 text-zinc-500">Item</th>
              <th className="text-right py-2 px-3 text-zinc-500">Amount</th>
              <th className="text-left py-2 px-4 text-zinc-500">Reference</th>
            </tr>
          </thead>
          <tbody>
            {displayMovements.map(m => (
              <tr key={m.id} className="border-t border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="py-2 px-4">
                  <p className="text-zinc-300">{m.date}</p>
                  <p className="text-[10px] text-zinc-600">{m.time}</p>
                </td>
                <td className="py-2 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 ${m.type === 'USED' ? 'bg-blue-900 text-blue-300' : 'bg-red-900 text-red-300'}`}>
                    {m.type}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <Link href={`/item/${m.itemId}`} className="font-medium hover:text-blue-400 transition-colors">{m.item}</Link>
                </td>
                <td className={`py-2 px-3 text-right ${m.type === 'WASTED' ? 'text-red-400' : ''}`}>
                  {m.qty} {m.unit} <span className="text-zinc-500">(₹{m.cost.toLocaleString()})</span>
                </td>
                <td className="py-2 px-4 text-zinc-500 text-xs">{m.ref || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {movements.length > 10 && (
        <div className="px-4 py-3 border-t border-zinc-800">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-zinc-400 hover:text-white"
          >
            {expanded ? '↑ Show Less' : `↓ Show All ${movements.length} Records`}
          </button>
        </div>
      )}
    </div>
  );
}
