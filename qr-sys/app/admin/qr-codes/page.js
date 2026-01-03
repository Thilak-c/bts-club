"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Download, ExternalLink, ArrowLeft, Settings } from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";

export default function QRCodesPage() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const tables = useQuery(api.tables.list);
  const [baseUrl, setBaseUrl] = useState("http://localhost:3001");
  const [showSettings, setShowSettings] = useState(false);

  const getQRCodeUrl = (tableNumber) => {
    const menuUrl = `${baseUrl}/menu/${tableNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}&bgcolor=000000&color=F4A259`;
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[--primary] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="w-9 h-9 flex items-center justify-center rounded-lg bg-[--card] border border-[--border] hover:border-[--primary]/30 transition-all">
                <ArrowLeft size={18} className="text-[--muted]" />
              </Link>
              <div>
                <h1 className="font-luxury text-lg font-semibold text-[--text-primary]">QR Codes</h1>
                <p className="text-xs text-[--muted]">Print for tables</p>
              </div>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${showSettings ? "btn-primary" : "bg-[--card] border border-[--border] text-[--muted] hover:border-[--primary]/30"}`}>
              <Settings size={14} /> Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {showSettings && (
          <div className="card rounded-xl p-4 mb-5 animate-slide-up">
            <label className="block text-xs text-[--muted] mb-2">Base URL</label>
            <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm" placeholder="https://your-domain.com" />
          </div>
        )}

        {!tables ? (
          <div className="card rounded-xl p-8 text-center"><div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : tables.length === 0 ? (
          <div className="card rounded-xl p-8 text-center"><p className="text-[--muted]">No tables. Seed database first.</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            {tables.map((table) => (
              <div key={table._id} className="card rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <img src="/logo.png" alt="BTS DISC" className="h-5" />
                  <h3 className="font-medium text-[--text-primary] text-sm">{table.name}</h3>
                </div>
                <div className="bg-[--bg] p-2 rounded-lg border border-[--border] mb-3">
                  <img src={getQRCodeUrl(table.number)} alt={`QR for ${table.name}`} className="w-full aspect-square rounded" />
                </div>
                <div className="flex gap-2">
                  <a href={getQRCodeUrl(table.number)} download={`table-${table.number}.png`} className="flex-1 flex items-center justify-center gap-1 text-xs text-[--muted] py-2 bg-[--bg] border border-[--border] rounded-lg hover:border-[--primary]/30">
                    <Download size={12} /> Save
                  </a>
                  <Link href={`/menu/${table.number}`} target="_blank" className="flex-1 flex items-center justify-center gap-1 text-xs text-[--primary] py-2 bg-[--primary]/10 border border-[--primary]/20 rounded-lg hover:bg-[--primary]/20">
                    <ExternalLink size={12} /> Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
