"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Pencil, Trash2, Plus, ArrowLeft, X, Check, MapPin } from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";

const categories = ["Starters", "Mains", "Sides", "Drinks", "Desserts", "Hookah"];

export default function AdminMenuPage() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
  const items = useQuery(api.menuItems.list);
  const zones = useQuery(api.zones.list);
  const createItem = useMutation(api.menuItems.create);
  const updateItem = useMutation(api.menuItems.update);
  const removeItem = useMutation(api.menuItems.remove);

  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", category: "Mains", image: "🍽️", description: "", allowedZones: [] });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[--primary] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated) return null;

  const handleSave = async () => {
    if (!formData.name || !formData.price) return;
    if (editingItem) {
      await updateItem({ id: editingItem._id, name: formData.name, price: parseFloat(formData.price), category: formData.category, image: formData.image, description: formData.description, available: editingItem.available, allowedZones: formData.allowedZones.length > 0 ? formData.allowedZones : [] });
    } else {
      await createItem({ name: formData.name, price: parseFloat(formData.price), category: formData.category, image: formData.image, description: formData.description, allowedZones: formData.allowedZones.length > 0 ? formData.allowedZones : [] });
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, price: item.price.toString(), category: item.category, image: item.image, description: item.description, allowedZones: item.allowedZones || [] });
    setEditingItem(item);
    setShowForm(true);
  };

  const toggleZone = (zoneId) => setFormData((prev) => ({ ...prev, allowedZones: prev.allowedZones.includes(zoneId) ? prev.allowedZones.filter((id) => id !== zoneId) : [...prev.allowedZones, zoneId] }));
  const selectAllZones = () => setFormData((prev) => ({ ...prev, allowedZones: [] }));
  const handleDelete = async (id) => { if (confirm("Delete this item?")) await removeItem({ id }); };
  const resetForm = () => { setFormData({ name: "", price: "", category: "Mains", image: "🍽️", description: "", allowedZones: [] }); setEditingItem(null); setShowForm(false); };

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
                <h1 className="font-luxury text-lg font-semibold text-[--text-primary]">Menu</h1>
                <p className="text-xs text-[--muted]">{items?.length || 0} items</p>
              </div>
            </div>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-1 btn-primary px-3 py-1.5 rounded-lg text-xs">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card rounded-2xl p-5 w-full max-w-sm animate-scale-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-luxury text-lg font-semibold text-[--text-primary]">{editingItem ? "Edit Item" : "Add Item"}</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-lg bg-[--bg] border border-[--border] flex items-center justify-center hover:border-[--primary]/30">
                  <X size={16} className="text-[--muted]" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[--muted] mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm" placeholder="Item name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[--muted] mb-1">Price</label>
                    <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs text-[--muted] mb-1">Emoji</label>
                    <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full rounded-lg px-3 py-2 text-center text-xl" placeholder="🍽️" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[--muted] mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm">
                    {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[--muted] mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm resize-none" rows={2} placeholder="Short description" />
                </div>
                <div>
                  <label className="block text-xs text-[--muted] mb-1">Available In Zones</label>
                  <div className="space-y-1">
                    <button type="button" onClick={selectAllZones} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${formData.allowedZones.length === 0 ? "bg-[--primary] text-black" : "bg-[--card] border border-[--border] text-[--muted] hover:border-[--primary]/30"}`}>
                      <span>All Zones</span>{formData.allowedZones.length === 0 && <Check size={14} />}
                    </button>
                    {zones?.map((zone) => (
                      <button key={zone._id} type="button" onClick={() => toggleZone(zone._id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${formData.allowedZones.includes(zone._id) ? "bg-[--info] text-white" : "bg-[--card] border border-[--border] text-[--muted] hover:border-[--info]/30"}`}>
                        <span>{zone.name}</span>{formData.allowedZones.includes(zone._id) && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={resetForm} className="flex-1 btn-secondary py-2 rounded-lg text-sm">Cancel</button>
                <button onClick={handleSave} className="flex-1 btn-primary py-2 rounded-lg text-sm">{editingItem ? "Update" : "Add"}</button>
              </div>
            </div>
          </div>
        )}

        {!items ? (
          <div className="card rounded-xl p-8 text-center"><div className="w-8 h-8 border-2 border-[--primary] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : items.length === 0 ? (
          <div className="card rounded-xl p-8 text-center"><p className="text-[--muted] mb-4">No menu items</p><button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 rounded-lg text-sm">Add First Item</button></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
            {items.map((item) => (
              <div key={item._id} className="card rounded-xl p-3">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-[--bg] border border-[--border] rounded-lg flex items-center justify-center text-2xl flex-shrink-0">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-[--text-primary] text-sm">{item.name}</h3>
                        <p className="text-xs text-[--muted] line-clamp-1">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(item)} className="w-7 h-7 rounded bg-[--info]/10 text-[--info] flex items-center justify-center hover:bg-[--info]/20"><Pencil size={12} /></button>
                        <button onClick={() => handleDelete(item._id)} className="w-7 h-7 rounded bg-[--error]/10 text-[--error] flex items-center justify-center hover:bg-[--error]/20"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[--muted] px-1.5 py-0.5 bg-[--border] rounded">{item.category}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 ${(!item.allowedZones || item.allowedZones.length === 0) ? 'bg-[--primary] text-black' : 'bg-[--info]/20 text-[--info]'}`}>
                          <MapPin size={10} />
                          {(!item.allowedZones || item.allowedZones.length === 0) ? "All" : item.allowedZones.length === 1 ? zones?.find(z => z._id === item.allowedZones[0])?.name?.split(' ')[0] || "1 zone" : `${item.allowedZones.length} zones`}
                        </span>
                      </div>
                      <span className="font-semibold text-[--primary] text-sm">${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
