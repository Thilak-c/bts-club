"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Pencil, Trash2, Plus, ArrowLeft, X, Table2 } from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";

export default function AdminTablesPage() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const tables = useQuery(api.tables.list);
  const zones = useQuery(api.zones.list);
  const createTable = useMutation(api.tables.create);
  const updateTable = useMutation(api.tables.update);
  const removeTable = useMutation(api.tables.remove);

  const [editingTable, setEditingTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", number: "", zoneId: "" });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[--primary] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return null;

  const handleSave = async () => {
    if (!formData.name || !formData.number) return;
    const data = { name: formData.name, number: parseInt(formData.number), zoneId: formData.zoneId || undefined };
    if (editingTable) await updateTable({ id: editingTable._id, ...data });
    else await createTable(data);
    resetForm();
  };

  const handleEdit = (table) => { setFormData({ name: table.name, number: table.number.toString(), zoneId: table.zoneId || "" }); setEditingTable(table); setShowForm(true); };
  const handleDelete = async (id) => { if (confirm("Delete this table?")) await removeTable({ id }); };
  const resetForm = () => { setFormData({ name: "", number: "", zoneId: "" }); setEditingTable(null); setShowForm(false); };

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="w-9 h-9 flex items-center justify-center rounded-lg bg-[--card] border border-[--border] hover:border-[--primary]/30 transition-all"><ArrowLeft size={18} className="text-[--muted]" /></Link>
              <div><h1 className="font-luxury text-lg font-semibold text-[--text-primary]">Tables</h1><p className="text-xs text-[--muted]">{tables?.length || 0} tables</p></div>
            </div>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1 btn-primary px-3 py-1.5 rounded-lg text-xs"><Plus size={14} /> Add</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card rounded-2xl p-5 w-full max-w-sm animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-luxury text-lg font-semibold text-[--text-primary]">{editingTable ? "Edit Table" : "Add Table"}</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-[--bg] border border-[--border] flex items-center justify-center"><X size={16} className="text-[--muted]" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-[--muted] mb-1">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm" placeholder="Table 1" /></div>
                  <div><label className="block text-xs text-[--muted] mb-1">Number</label><input type="number" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm" placeholder="1" min="1" /></div>
                </div>
                <div><label className="block text-xs text-[--muted] mb-1">Zone</label><select value={formData.zoneId} onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm"><option value="">All Zones</option>{zones?.map((zone) => (<option key={zone._id} value={zone._id}>{zone.name}</option>))}</select></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={resetForm} className="flex-1 btn-secondary py-2 rounded-lg text-sm">Cancel</button>
                <button onClick={handleSave} className="flex-1 btn-primary py-2 rounded-lg text-sm">{editingTable ? "Update" : "Add"}</button>
              </div>
            </div>
          </div>
        )}

        {!tables ? (
          <div className="card rounded-xl p-8 text-center"><div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : tables.length === 0 ? (
          <div className="card rounded-xl p-8 text-center"><Table2 size={32} className="text-[--primary] mx-auto mb-3" /><p className="text-[--muted] mb-4">No tables yet</p><button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 rounded-lg text-sm">Add First Table</button></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 stagger-children">
            {tables.map((table) => (
              <div key={table._id} className="card rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-[--primary]/20 rounded-lg flex items-center justify-center"><span className="text-[--primary] font-bold">{table.number}</span></div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(table)} className="w-7 h-7 rounded bg-[--info]/10 text-[--info] flex items-center justify-center hover:bg-[--info]/20"><Pencil size={12} /></button>
                    <button onClick={() => handleDelete(table._id)} className="w-7 h-7 rounded bg-[--error]/10 text-[--error] flex items-center justify-center hover:bg-[--error]/20"><Trash2 size={12} /></button>
                  </div>
                </div>
                <h3 className="font-medium text-[--text-primary] text-sm">{table.name}</h3>
                {table.zone ? <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-[--info]/20 text-[--info] rounded">{table.zone.name}</span> : <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-[--primary] text-black rounded">All Zones</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
