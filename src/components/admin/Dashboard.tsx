import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, IndianRupee, Clock, TrendingUp } from "lucide-react";

type Order = { id: string; status: string; total_inr: number; created_at: string };

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [o, p, low] = await Promise.all([
        supabase.from("orders").select("id,status,total_inr,created_at").order("created_at", { ascending: false }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).lte("stock", 5),
      ]);
      setOrders((o.data as any) || []);
      setProductCount(p.count || 0);
      setLowStock(low.count || 0);
      setLoading(false);
    })();
  }, []);

  const active = orders.filter(o => o.status !== "cancelled");
  const revenue = active.filter(o => ["paid", "shipped", "delivered"].includes(o.status))
    .reduce((s, o) => s + Number(o.total_inr), 0);
  const pending = orders.filter(o => o.status === "pending").length;
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const total = active
      .filter(o => o.created_at.slice(0, 10) === key)
      .reduce((s, o) => s + Number(o.total_inr), 0);
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), total };
  });
  const max = Math.max(1, ...last7Days.map(d => d.total));

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<IndianRupee size={18} />} label="Revenue" value={`₹${revenue.toLocaleString("en-IN")}`} />
        <Stat icon={<ShoppingBag size={18} />} label="Total Orders" value={orders.length} />
        <Stat icon={<Clock size={18} />} label="Pending" value={pending} accent />
        <Stat icon={<Package size={18} />} label="Products" value={productCount} sub={lowStock ? `${lowStock} low stock` : undefined} />
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="font-display font-semibold uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> Sales — last 7 days
        </h3>
        <div className="flex items-end gap-3 h-40">
          {last7Days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-[10px] text-muted-foreground">₹{d.total.toLocaleString("en-IN")}</div>
              <div className="w-full bg-signal/90 rounded-t transition-all" style={{ height: `${(d.total / max) * 100}%`, minHeight: 2 }} />
              <div className="text-xs font-medium">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="font-display font-semibold uppercase text-sm tracking-wider mb-4">Recent orders</h3>
        <div className="space-y-2 text-sm">
          {orders.slice(0, 5).map(o => (
            <div key={o.id} className="flex items-center justify-between border-b last:border-0 pb-2">
              <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</span>
              <span className="text-xs uppercase">{o.status}</span>
              <span className="font-semibold">₹{Number(o.total_inr).toLocaleString("en-IN")}</span>
            </div>
          ))}
          {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: boolean }) => (
  <div className={`border rounded-lg p-4 ${accent ? "bg-signal/5 border-signal/30" : ""}`}>
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">{icon} {label}</div>
    <div className="font-display text-2xl font-bold">{value}</div>
    {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
  </div>
);

export default Dashboard;
