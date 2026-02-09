"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrdersByUser, type Order } from "@/lib/db";

function formatDate(value: unknown) {
  try {
    if (!value) return "—";
    const val = value as { toDate?: () => Date };
    if (val?.toDate) return val.toDate().toLocaleString();
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString();
    return "—";
  } catch {
    return "—";
  }
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const cls = useMemo(() => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  }, [status]);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login?redirect=/orders");
        return;
      }
      setUser(currentUser);
      setLoading(true);
      const data = await getOrdersByUser(currentUser.uid);
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fff9f2] flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2d1e1e] font-serif">My Orders</h1>
            <p className="text-[#8c7676] mt-2">
              {user?.email ? <>Signed in as <strong>{user.email}</strong></> : " "}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#e85d41] mx-auto mb-4"></div>
            <p className="text-[#8c7676] font-bold uppercase tracking-widest text-xs">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
            <h2 className="text-xl font-bold text-[#2d1e1e] font-serif">No orders yet</h2>
            <p className="text-[#8c7676] mt-2">Once you place an order, it will show up here.</p>
            <button
              onClick={() => router.push("/products")}
              className="mt-6 inline-flex items-center justify-center bg-[#e85d41] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#d14d34] transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[#2d1e1e] font-mono">
                            #{(o.id || "").slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-500">{o.paymentMethod?.toUpperCase()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">
                          {(o.items || []).slice(0, 2).map((it, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-3">
                              <span className="truncate max-w-[260px]">{it?.name || "Item"}</span>
                              <span className="text-xs text-slate-500 font-bold">x{it?.quantity || 1}</span>
                            </div>
                          ))}
                          {(o.items || []).length > 2 && (
                            <p className="text-xs text-slate-400 mt-1">+ {(o.items || []).length - 2} more</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[#e85d41] font-mono">${Number(o.total || 0).toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={o.status} />
                        {o.adminNote ? (
                          <p className="text-[10px] text-slate-400 italic mt-2 max-w-[240px] truncate" title={o.adminNote}>
                            Note: {o.adminNote}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{formatDate(o.createdAt)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

