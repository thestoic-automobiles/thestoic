import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Order = { id: string; status: string; total_inr: number; created_at: string };
type Profile = { full_name: string | null; email: string | null; mobile: string | null; account_type: string; customer_code: string | null };

const Account = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth?redirect=/account");
    });
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate("/auth?redirect=/account"); return; }
      const [p, o] = await Promise.all([
        supabase.from("profiles").select("full_name,email,mobile,account_type,customer_code").eq("id", u.user.id).maybeSingle(),
        supabase.from("orders").select("id,status,total_inr,created_at").order("created_at", { ascending: false }),
      ]);
      setProfile(p.data as any);
      setOrders((o.data as any) || []);
      setLoading(false);
    })();
  }, [navigate]);

  const signOut = async () => { await supabase.auth.signOut(); navigate("/"); };

  if (loading) return <Layout><div className="container mx-auto py-32 text-center">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto pt-28 pb-16 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">My Account</h1>
          <Button variant="outline" onClick={signOut}>Sign out</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Info label="Name" value={profile?.full_name || "—"} />
          <Info label="Email" value={profile?.email || "—"} />
          <Info label="Mobile" value={profile?.mobile || "—"} />
          <Info label="Account type" value={(profile?.account_type || "b2c").toUpperCase()} />
          {profile?.customer_code && <Info label="Customer code" value={profile.customer_code} />}
        </div>

        <h2 className="font-display text-xl uppercase font-bold mb-3">Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-md text-muted-foreground">
            No orders yet — <Link to="/shop" className="text-signal underline">browse parts</Link>
          </div>
        ) : (
          <div className="border border-border rounded-md divide-y divide-border">
            {orders.map((o) => (
              <div key={o.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm">{new Date(o.created_at).toLocaleString("en-IN")}</p>
                </div>
                <span className="text-xs uppercase font-semibold tracking-wider px-2 py-1 bg-secondary rounded-sm">{o.status}</span>
                <p className="font-display text-lg font-bold">₹{Number(o.total_inr).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-border rounded-md p-4 bg-card">
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default Account;
