'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { href: '/', label: 'DASHBOARD', icon: '◉' },
  { href: '/inventory', label: 'INVENTORY', icon: '▤' },
  { href: '/wastage', label: 'WASTAGE', icon: '✕' },
  { href: '/deductions', label: 'DEDUCTIONS', icon: '▼' },
  { href: '/alerts', label: 'ALERTS', icon: '!' },
  { href: '/reports', label: 'REPORTS', icon: '▦' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const inventory = useQuery(api.inventory.list);
  const today = new Date().toISOString().split('T')[0];
  const wastage = useQuery(api.wastage.list, { date: today });

  // Close search on click outside
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const totalValue = inventory?.items?.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0) || 0;
  const lowStockCount = inventory?.items?.filter(i => i.quantity <= i.minStock).length || 0;
  const todayLoss = wastage?.totalLoss || 0;

  // Search results
  const searchResults = search.length > 0 
    ? inventory?.items?.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5) || []
    : [];

  function handleSelect(itemId) {
    router.push(`/item/${itemId}`);
    setSearch('');
    setShowResults(false);
  }

  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 min-h-screen p-4 flex flex-col">
      <div className="mb-4 pb-4 border-b border-zinc-800">
        <h1 className="text-sm font-bold text-white tracking-tight">ISC SYSTEM</h1>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Stock Control</p>
      </div>

      {/* Global Search */}
      <div className="mb-4 relative" ref={searchRef}>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => { setSearch(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-zinc-950 border border-zinc-800 border-t-0 z-50 max-h-48 overflow-y-auto">
            {searchResults.map(item => (
              <button
                key={item._id}
                onClick={() => handleSelect(item._id)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 flex justify-between items-center"
              >
                <span>{item.name}</span>
                <span className="text-zinc-600">{item.quantity} {item.unit}</span>
              </button>
            ))}
          </div>
        )}
        {showResults && search.length > 0 && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 bg-zinc-950 border border-zinc-800 border-t-0 z-50 px-3 py-2 text-xs text-zinc-600">
            No items found
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mb-4 space-y-2">
        <div className="bg-zinc-950 p-3 border border-zinc-800">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest">STOCK VALUE</p>
          <p className="text-lg font-bold text-emerald-400">₹{totalValue.toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-950 p-2 border border-zinc-800">
            <p className="text-[9px] text-zinc-600 uppercase">TODAY LOSS</p>
            <p className={`text-sm font-bold ${todayLoss > 0 ? 'text-red-400' : 'text-zinc-500'}`}>₹{todayLoss.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-950 p-2 border border-zinc-800">
            <p className="text-[9px] text-zinc-600 uppercase">LOW STOCK</p>
            <p className={`text-sm font-bold ${lowStockCount > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>{lowStockCount}</p>
          </div>
        </div>
      </div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wide transition-colors ${
                isActive
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <span className="w-4 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-zinc-800 text-[10px] text-zinc-700">
        v1.0 • RAW ITEM MANAGER
      </div>
    </aside>
  );
}
