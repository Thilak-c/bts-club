"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Pencil, Trash2, Plus, ArrowLeft, X, MapPin } from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";

export default function AdminZonesPage() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const zones = useQuery(api.zones.list);
  const tables = useQuery(api.tables.list);
  const createZone = useMutation(api.zones.create);
  const updateZone = useMutation(api.zones.update);
  const removeZone = useMutation(api.zones.remove);
  const seedZones = useMutation(api.zones.seed);

  const [editingZone, setEditingZone] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[--primary] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return null;

  const handleSave = async () => {
    if (!formData.name) return;
    if (editingZone) await updateZone({ id: editingZone._id, name: formData.name, description: formData.description });
    else await createZone({ name: formData.name, description: formData.description });
    resetForm();
  };

  const handleEdit = (zone) => { setFormData({ name: zone.name, description: zone.description }); setEditingZone(zone); setShowForm(true); };
  const handleDelete = async (id) => { if (confirm("Delete this zone?")) await removeZone({ id }); };
  const resetForm = () => { setFormData({ name: "", description: "" }); setEditingZone(null); setShowForm(false); };
  const getTablesInZone = (zoneId) => tables?.filter((t) => t.zoneId === zoneId) || [];

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="w-9 h-9 flex items-center justify-center rounded-lg bg-[--card] border border-[--border] hover:border-[--primary]/30 transition-all"><ArrowLeft size={18} className="text-[--muted]" /></Link>
              <div><h1 className="font-luxury text-lg font-semibold text-[--text-primary]">Zones</h1><p className="text-xs text-[--muted]">{zones?.length || 0} zones</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => seedZones()} className="text-xs text-[--muted] hover:text-[--primary] px-3 py-1.5 border border-[--border] rounded-lg">Seed</button>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-1 btn-primary px-3 py-1.5 rounded-lg text-xs"><Plus size={14} /> Add</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card rounded-2xl p-5 w-full max-w-sm animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-luxury text-lg font-semibold text-[--text-primary]">{editingZone ? "Edit Zone" : "Add Zone"}</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-[--bg] border border-[--border] flex items-center justify-center"><X size={16} className="text-[--muted]" /></button>
              </div>
              <div className="space-y-3">
                <div><label className="block text-xs text-[--muted] mb-1">Zone Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm" placeholder="e.g. Smoking Zone" /></div>
                <div><label className="block text-xs text-[--muted] mb-1">Description</label><input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm" placeholder="e.g. Hookah allowed" /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={resetForm} className="flex-1 btn-secondary py-2 rounded-lg text-sm">Cancel</button>
                <button onClick={handleSave} className="flex-1 btn-primary py-2 rounded-lg text-sm">{editingZone ? "Update" : "Add"}</button>
              </div>
            </div>
          </div>
        )}

        {!zones ? (
          <div className="card rounded-xl p-8 text-center"><div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : zones.length === 0 ? (
          <div className="card rounded-xl p-8 text-center"><MapPin size={32} className="text-[--primary] mx-auto mb-3" /><p className="text-[--muted] mb-4">No zones yet</p><button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 rounded-lg text-sm">Add First Zone</button></div>
        ) : (
          <div className="space-y-3 stagger-children">
            {zones.map((zone) => {
              const zoneTables = getTablesInZone(zone._id);
              return (
                <div key={zone._id} className="card rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[--primary]/20 rounded-lg flex items-center justify-center"><MapPin size={18} className="text-[--primary]" /></div>
                      <div>
                        <h3 className="font-medium text-[--text-primary]">{zone.name}</h3>
                        <p className="text-xs text-[--muted]">{zone.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-[--primary]">{zoneTables.length} tables</span>
                          {zoneTables.length > 0 && <span className="text-xs text-[--muted]">({zoneTables.map((t) => t.name).join(", ")})</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(zone)} className="w-8 h-8 rounded bg-[--info]/10 text-[--info] flex items-center justify-center hover:bg-[--info]/20"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(zone._id)} className="w-8 h-8 rounded bg-[--error]/10 text-[--error] flex items-center justify-center hover:bg-[--error]/20"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
