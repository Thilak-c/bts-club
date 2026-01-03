"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, ArrowRight } from "lucide-react";

const ADMIN_ID = "admin";
const ADMIN_PASS = "admin123";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username === ADMIN_ID && password === ADMIN_PASS) {
        sessionStorage.setItem("admin-auth", "true");
        router.push("/admin");
      } else {
        setError("Invalid credentials");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="card rounded-2xl p-6 animate-scale-in">
          <div className="h-px bg-[--border] mb-6"></div>
          <div className="text-center mb-6">
            <img src="/logo.png" alt="BTS DISC" className="h-12 mx-auto mb-3" />
            <h1 className="font-luxury text-xl font-semibold text-[--text-primary]">Admin Login</h1>
            <p className="text-[--muted] text-xs mt-1">BTS DISC Private Limited</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs tracking-widest text-[--muted] mb-2 uppercase">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" size={16} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm" placeholder="Username" required />
              </div>
            </div>
            <div>
              <label className="block text-xs tracking-widest text-[--muted] mb-2 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]" size={16} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm" placeholder="Password" required />
              </div>
            </div>
            {error && <div className="bg-[--error]/10 border border-[--error]/30 text-[--error] text-xs p-3 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <>Login <ArrowRight size={16} /></>}
            </button>
          </form>
          <div className="mt-4 p-3 bg-[--bg] border border-[--border] rounded-lg">
            <p className="text-xs text-[--muted] text-center">Demo: admin / admin123</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <Link href="/" className="text-[--muted] hover:text-[--primary] text-xs transition-colors">← Customer View</Link>
        </div>
      </div>
    </div>
  );
}
