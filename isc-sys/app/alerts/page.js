'use client';

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import StockBadge from '../components/StockBadge';

export default function AlertsPage() {
  const settings = useQuery(api.alerts.getSettings);
  const lowStockItems = useQuery(api.inventory.getLowStock);
  const updateSettings = useMutation(api.alerts.updateSettings);

  const [localSettings, setLocalSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (!settings || !lowStockItems) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">LOADING...</div>;
  }

  const currentSettings = localSettings || settings;

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await updateSettings({ whatsappNumber: currentSettings.whatsappNumber, alertsEnabled: currentSettings.alertsEnabled });
    setSaving(false);
    setLocalSettings(null);
    setMessage('Settings saved');
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="p-6">
      <div className="mb-6 border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">ALERTS</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest">Notification Settings</p>
      </div>

      {message && (
        <div className="bg-emerald-950 border border-emerald-800 p-3 mb-6 text-sm text-emerald-400">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-4">WHATSAPP ALERTS</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full px-3 py-2 text-sm"
                value={currentSettings.whatsappNumber}
                onChange={e => setLocalSettings({ ...currentSettings, whatsappNumber: e.target.value })}
                placeholder="+91 98765 43210"
              />
              <p className="text-[10px] text-zinc-600 mt-1">Include country code</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="alertsEnabled"
                checked={currentSettings.alertsEnabled}
                onChange={e => setLocalSettings({ ...currentSettings, alertsEnabled: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="alertsEnabled" className="text-sm">Enable automatic low-stock alerts</label>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-white text-black py-2 text-xs font-bold uppercase tracking-wide hover:bg-zinc-200 disabled:opacity-50">
              {saving ? 'SAVING...' : 'SAVE SETTINGS'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-3">Manual Alerts</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-zinc-800 text-zinc-400 py-2 text-xs uppercase tracking-wide hover:bg-zinc-700" disabled={!currentSettings.whatsappNumber}>
                Send Low Stock Alert
              </button>
              <button className="flex-1 bg-zinc-800 text-zinc-400 py-2 text-xs uppercase tracking-wide hover:bg-zinc-700" disabled={!currentSettings.whatsappNumber}>
                Send Daily Report
              </button>
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-zinc-900 border border-zinc-800">
          <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">LOW STOCK ITEMS</h2>
            <span className="text-xs text-zinc-600">{lowStockItems.length} items</span>
          </div>
          
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-emerald-400 font-bold">ALL ITEMS STOCKED</p>
              <p className="text-zinc-600 text-xs mt-1">No alerts required</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {lowStockItems.map(item => (
                <div key={item._id} className="flex justify-between items-center p-3 bg-zinc-950">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-[10px] text-zinc-600 uppercase">{item.category}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`font-bold ${item.quantity === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-[10px] text-zinc-600">Min: {item.minStock}</p>
                    </div>
                    <StockBadge quantity={item.quantity} minStock={item.minStock} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Integration Info */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 mt-6">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">INTEGRATION</h2>
        <p className="text-sm text-zinc-500">
          To enable real WhatsApp alerts, integrate with Twilio WhatsApp API or WhatsApp Business API.
          Settings are stored in database. Add a scheduled function to check low stock and send alerts automatically.
        </p>
      </div>
    </div>
  );
}
