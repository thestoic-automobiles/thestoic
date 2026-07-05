import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

type Order = {
  id: string;
  status: string;
  total_inr: number;
  contact_phone: string | null;
  shipping_address: any;
  notes: string | null;
  created_at: string;
  user_id: string;
};
type Item = { id: string; order_id: string; product_name: string; qty: number; price_inr: number };

const STATUSES = ["pending", "processing", "paid", "shipped", "delivered", "cancelled"];
const COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  paid: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Record<string, Item[]>>({});
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: o } = await supabase.from("orders")
      .select("id,status,total_inr,contact_phone,shipping_address,notes,created_at,user_id")
      .order("created_at", { ascending: false });
    const ords = (o as any) || [];
    setOrders(ords);
    if (ords.length) {
      const { data: it } = await supabase.from("order_items")
        .select("id,order_id,product_name,qty,price_inr")
        .in("order_id", ords.map((x: Order) => x.id));
      const grouped: Record<string, Item[]> = {};
      ((it as any) || []).forEach((x: Item) => {
        (grouped[x.order_id] ||= []).push(x);
      });
      setItems(grouped);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
  };

  const list = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {["all", ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm border ${filter === s ? "bg-charcoal text-primary-foreground border-charcoal" : "bg-background hover:bg-secondary"}`}>
            {s} {s !== "all" && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading orders…</p>}
      {!loading && list.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center border rounded">No orders.</p>}

      <div className="space-y-2">
        {list.map(o => {
          const addr = o.shipping_address || {};
          const isOpen = open === o.id;
          return (
            <div key={o.id} className="border rounded-lg overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 p-4">
                <button onClick={() => setOpen(isOpen ? null : o.id)} className="text-muted-foreground">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <div className="flex-1 min-w-[180px]">
                  <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm">{new Date(o.created_at).toLocaleString("en-IN")}</p>
                </div>
                <div className="text-sm">{addr.full_name || "—"} • {o.contact_phone || "—"}</div>
                <div className="font-display text-lg font-bold">₹{Number(o.total_inr).toLocaleString("en-IN")}</div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${COLORS[o.status] || "bg-secondary"}`}>{o.status}</span>
                <select value={o.status} onChange={e => setStatus(o.id, e.target.value)}
                  className="h-9 px-2 rounded border bg-background text-sm">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {isOpen && (
                <div className="bg-secondary/40 p-4 border-t text-sm space-y-3">
                  <div>
                    <div className="font-semibold mb-1">Shipping address</div>
                    <div className="text-muted-foreground whitespace-pre-line">
                      {[addr.address_line1, addr.address_line2, addr.landmark, `${addr.city || ""} - ${addr.pincode || ""}`, addr.state].filter(Boolean).join("\n") || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Items</div>
                    <ul className="text-muted-foreground space-y-0.5">
                      {(items[o.id] || []).map(it => (
                        <li key={it.id}>• {it.qty} × {it.product_name} — ₹{(it.qty * Number(it.price_inr)).toLocaleString("en-IN")}</li>
                      ))}
                    </ul>
                  </div>
                  {o.notes && <div><span className="font-semibold">Notes:</span> {o.notes}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersManager;
