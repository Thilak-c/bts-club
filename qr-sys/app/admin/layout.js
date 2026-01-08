'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/lib/useAdminAuth';

const navItems = [
  { href: '/admin', label: 'DASHBOARD', icon: '◉' },
  { href: '/admin/orders', label: 'ORDERS', icon: '▤' },
  { href: '/admin/menu', label: 'MENU', icon: '◈' },
  { href: '/admin/tables', label: 'TABLES', icon: '▦' },
  { href: '/admin/reservations', label: 'RESERVATIONS', icon: '📅' },
  { href: '/admin/zones', label: 'ZONES', icon: '◎' },
  { href: '/admin/qr-codes', label: 'QR CODES', icon: '⊞' },
  { href: '/admin/reports', label: 'REPORTS', icon: '▣' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { isAuthenticated, loading, logout } = useAdminAuth();

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono">
        LOADING...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono flex">
      {/* Sidebar */}
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 min-h-screen p-4 flex flex-col">
        <div className="mb-6 pb-4 border-b border-zinc-800">
          <h1 className="text-sm font-bold text-white tracking-tight">BTS DISC</h1>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Admin Panel</p>
        </div>
        
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
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

        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <Link href="/" className="block text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-wide">
            ← Customer View
          </Link>
          <button 
            onClick={logout}
            className="w-full text-left text-[10px] text-red-500 hover:text-red-400 uppercase tracking-wide"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
