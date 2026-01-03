"use client";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ClipboardList, UtensilsCrossed, QrCode, Database, LogOut, TrendingUp, Clock, ChefHat, MapPin, Table2, Bell, Star, Check } from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";

export default function AdminDashboard() {
  const { isAuthenticated, loading, logout } = useAdminAuth();
  const stats = useQuery(api.orders.getStats);
  const orders = useQuery(api.orders.list);
  const staffCalls = useQuery(api.staffCalls.listPending);
  const zoneRequests = useQuery(api.zoneRequests.listPending);
  const resolveStaffCall = useMutation(api.staffCalls.updateStatus);
  const resolveZoneRequest = useMutation(api.zoneRequests.updateStatus);
  const seedMenu = useMutation(api.menuItems.seed);
  const seedZones = useMutation(api.zones.seed);
  const seedTables = useMutation(api.tables.seed);

  const handleSeed = async () => {
    await seedZones();
    await seedMenu();
    await seedTables();
    alert("Database seeded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[--primary] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="BTS DISC" className="h-8" />
              <div>
                <h1 className="font-luxury text-lg font-semibold text-[--text-primary]">BTS DISC</h1>
                <p className="text-xs text-[--muted]">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs text-[--muted] hover:text-[--primary] transition-colors">Customer View</Link>
              <button onClick={logout} className="flex items-center gap-1 text-[--error] text-xs px-3 py-1.5 rounded-lg border border-[--error]/30 hover:bg-[--error]/10 transition-colors">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        <button onClick={handleSeed} className="mb-5 flex items-center gap-2 btn-primary px-4 py-2 rounded-lg text-xs animate-fade-in">
          <Database size={14} /> Seed Database
        </button>

        <div className="grid grid-cols-3 gap-3 mb-5 stagger-children">
          <div className="card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[--primary]/20 rounded-lg flex items-center justify-center">
                <Clock size={18} className="text-[--primary]" />
              </div>
              <div>
                <p className="text-xs text-[--muted]">Pending</p>
                <p className="text-xl font-semibold text-[--text-primary]">{stats?.pendingOrders ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[--info]/20 rounded-lg flex items-center justify-center">
                <ChefHat size={18} className="text-[--info]" />
              </div>
              <div>
                <p className="text-xs text-[--muted]">Preparing</p>
                <p className="text-xl font-semibold text-[--text-primary]">{stats?.preparingOrders ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[--success]/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={18} className="text-[--success]" />
              </div>
              <div>
                <p className="text-xs text-[--muted]">Revenue</p>
                <p className="text-xl font-semibold text-[--primary]">${(stats?.todayRevenue ?? 0).toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3 stagger-children">
          <Link href="/admin/orders" className="card rounded-xl p-4 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[--primary]/10 border border-[--primary]/20 rounded-lg flex items-center justify-center group-hover:bg-[--primary]/20 transition-all">
                <ClipboardList size={18} className="text-[--primary]" />
              </div>
              <div>
                <h2 className="font-medium text-[--text-primary] text-sm">Orders</h2>
                <p className="text-xs text-[--muted]">Manage</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/menu" className="card rounded-xl p-4 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[--info]/10 border border-[--info]/20 rounded-lg flex items-center justify-center group-hover:bg-[--info]/20 transition-all">
                <UtensilsCrossed size={18} className="text-[--info]" />
              </div>
              <div>
                <h2 className="font-medium text-[--text-primary] text-sm">Menu</h2>
                <p className="text-xs text-[--muted]">Edit items</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/qr-codes" className="card rounded-xl p-4 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[--success]/10 border border-[--success]/20 rounded-lg flex items-center justify-center group-hover:bg-[--success]/20 transition-all">
                <QrCode size={18} className="text-[--success]" />
              </div>
              <div>
                <h2 className="font-medium text-[--text-primary] text-sm">QR Codes</h2>
                <p className="text-xs text-[--muted]">Generate</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 stagger-children">
          <Link href="/admin/tables" className="card rounded-xl p-4 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[--primary]/10 border border-[--primary]/20 rounded-lg flex items-center justify-center group-hover:bg-[--primary]/20 transition-all">
                <Table2 size={18} className="text-[--primary]" />
              </div>
              <div>
                <h2 className="font-medium text-[--text-primary] text-sm">Tables</h2>
                <p className="text-xs text-[--muted]">Manage tables</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/zones" className="card rounded-xl p-4 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[--muted]/10 border border-[--muted]/20 rounded-lg flex items-center justify-center group-hover:bg-[--muted]/20 transition-all">
                <MapPin size={18} className="text-[--muted]" />
              </div>
              <div>
                <h2 className="font-medium text-[--text-primary] text-sm">Zones</h2>
                <p className="text-xs text-[--muted]">Smoking, VIP, etc.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Staff Calls & Zone Requests */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="card rounded-xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[--border]">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-[--error]" />
                <h2 className="font-medium text-[--text-primary] text-sm">Staff Calls</h2>
                {staffCalls && staffCalls.length > 0 && (
                  <span className="px-2 py-0.5 bg-[--error] text-white text-xs rounded-full">{staffCalls.length}</span>
                )}
              </div>
            </div>
            {!staffCalls || staffCalls.length === 0 ? (
              <div className="p-6 text-center"><p className="text-[--muted] text-sm">No pending calls</p></div>
            ) : (
              <div className="divide-y divide-[--border] max-h-48 overflow-y-auto">
                {staffCalls.map((call) => (
                  <div key={call._id} className="p-3 hover:bg-[--border]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[--text-primary] text-sm">Table {call.tableNumber}</p>
                        <p className="text-xs text-[--muted]">{call.zoneName || "Unknown zone"}</p>
                        {call.reason && <p className="text-xs text-[--primary] mt-1">{call.reason}</p>}
                      </div>
                      <button
                        onClick={() => resolveStaffCall({ id: call._id, status: "resolved" })}
                        className="w-8 h-8 rounded-lg bg-[--success]/20 flex items-center justify-center hover:bg-[--success]/30 transition-all"
                      >
                        <Check size={14} className="text-[--success]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card rounded-xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[--border]">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-[--primary]" />
                <h2 className="font-medium text-[--text-primary] text-sm">Zone Requests</h2>
                {zoneRequests && zoneRequests.length > 0 && (
                  <span className="px-2 py-0.5 bg-[--primary] text-black text-xs rounded-full">{zoneRequests.length}</span>
                )}
              </div>
            </div>
            {!zoneRequests || zoneRequests.length === 0 ? (
              <div className="p-6 text-center"><p className="text-[--muted] text-sm">No pending requests</p></div>
            ) : (
              <div className="divide-y divide-[--border] max-h-48 overflow-y-auto">
                {zoneRequests.map((req) => (
                  <div key={req._id} className="p-3 hover:bg-[--border]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[--text-primary] text-sm">Table {req.tableNumber}</p>
                        <p className="text-xs text-[--muted]">{req.currentZone || "Current"} → <span className="text-[--primary]">{req.requestedZone}</span></p>
                      </div>
                      <button
                        onClick={() => resolveZoneRequest({ id: req._id, status: "approved" })}
                        className="w-8 h-8 rounded-lg bg-[--success]/20 flex items-center justify-center hover:bg-[--success]/30 transition-all"
                      >
                        <Check size={14} className="text-[--success]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card rounded-xl overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-[--border]">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-[--text-primary] text-sm">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-[--primary] hover:text-[--primary-hover]">View All →</Link>
            </div>
          </div>
          {!orders || orders.length === 0 ? (
            <div className="p-8 text-center"><p className="text-[--muted] text-sm">No orders yet</p></div>
          ) : (
            <div className="divide-y divide-[--border]">
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} className="p-3 hover:bg-[--border]/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {order.items.slice(0, 2).map((item, i) => (<span key={i} className="text-lg">{item.image}</span>))}
                      </div>
                      <div>
                        <p className="font-medium text-[--text-primary] text-sm">#{order.orderNumber || order._id.slice(-4)}</p>
                        <p className="text-xs text-[--muted]">Table {order.tableId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[--primary] text-sm">${order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        order.status === "pending" ? "status-pending" :
                        order.status === "preparing" ? "status-preparing" :
                        order.status === "ready" ? "status-ready" : "status-completed"
                      }`}>{order.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
