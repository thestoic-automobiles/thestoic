import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SHOP_PHONE = "+917387480081";
const SHOP_EMAIL = "supportthestoic@gmail.com";

const RAZORPAY_METHOD = { id: "razorpay", label: "Pay Online (Razorpay)", desc: "UPI, Cards, Netbanking, Wallets — secure instant payment" } as const;
const B2B_METHODS = [
  RAZORPAY_METHOD,
  { id: "upi", label: "UPI (Manual)", desc: "Google Pay, PhonePe, Paytm — confirm on WhatsApp" },
  { id: "cod", label: "Cash / Credit on Delivery", desc: "Settle at delivery — B2B account only" },
] as const;

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a 10-digit phone"),
  address_line1: z.string().trim().min(3, "Enter Flat / House / Building").max(200),
  address_line2: z.string().trim().min(3, "Enter Area / Street / Village").max(200),
  landmark: z.string().trim().max(100).optional(),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Enter a 6-digit pincode"),
  city: z.string().trim().min(2, "Enter Town / City").max(80),
  state: z.string().trim().min(2, "Enter State").max(80),
  delivery: z.enum(["Home Delivery", "Store Pickup"]),
  payment: z.enum(["razorpay", "upi", "cod"]),
  notes: z.string().max(500).optional(),
});

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [isB2B, setIsB2B] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "",
    address_line1: "", address_line2: "", landmark: "",
    pincode: "", city: "", state: "",
    delivery: "Home Delivery", payment: "razorpay", notes: "",
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const { data: p } = await supabase.from("profiles").select("account_type").eq("id", u.user.id).maybeSingle();
        if (p?.account_type === "b2b") setIsB2B(true);
      }
      setProfileLoaded(true);
    })();
  }, []);

  const availableMethods = isB2B ? B2B_METHODS : [RAZORPAY_METHOD];

  if (items.length === 0) {
    return <Layout><div className="container mx-auto py-32 text-center">Your cart is empty. <a href="/shop" className="text-signal underline">Shop parts</a></div></Layout>;
  }

  const paymentLabel = availableMethods.find((m) => m.id === form.payment)?.label ?? form.payment;

  const buildMessage = () => {
    const lines = [
      `*New Order — The Stoic Automobiles*`,
      ``,
      `Name: ${form.full_name}`,
      `Phone: ${form.phone}`,
      ``,
      `*Delivery Address:*`,
      form.address_line1,
      form.address_line2,
      form.landmark ? `Landmark: ${form.landmark}` : "",
      `${form.city} - ${form.pincode}, ${form.state}`,
      ``,
      `Delivery: ${form.delivery}`,
      `Payment: ${paymentLabel}`,
      ``,
      `*Items:*`,
      ...items.map((i) => `• ${i.qty} × ${i.name} — ₹${(i.qty * Number(i.price_inr)).toLocaleString("en-IN")}`),
      ``,
      `*Total: ₹${subtotal.toLocaleString("en-IN")}*`,
      form.notes ? `\nNotes: ${form.notes}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }

    // Persist order to DB if the customer is signed in (so they can track it).
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: ord, error } = await supabase.from("orders").insert({
        user_id: u.user.id,
        status: "pending",
        total_inr: subtotal,
        contact_phone: form.phone,
        shipping_address: {
          full_name: form.full_name,
          address_line1: form.address_line1,
          address_line2: form.address_line2,
          landmark: form.landmark,
          pincode: form.pincode,
          city: form.city,
          state: form.state,
          delivery: form.delivery,
          payment: paymentLabel,
        },
        notes: form.notes || null,
      }).select("id").single();
      if (!error && ord) {
        await supabase.from("order_items").insert(
          items.map((i) => ({
            order_id: ord.id,
            product_id: i.id,
            product_name: i.name,
            qty: i.qty,
            price_inr: i.price_inr,
          }))
        );
      } else if (error) {
        console.error(error);
        toast.error("Could not save order to your account, but we'll still confirm on WhatsApp.");
      }
    }

    if (form.payment === "razorpay") {
      try {
        const { data, error } = await supabase.functions.invoke("razorpay-create-order", {
          body: { amount_inr: subtotal },
        });
        if (error || !data?.order) throw error || new Error("Could not create order");
        // @ts-expect-error Razorpay script global
        const rzp = new window.Razorpay({
          key: data.key_id,
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          name: "The Stoic Automobiles",
          description: "Order Payment",
          prefill: { name: form.full_name, contact: form.phone },
          theme: { color: "#C2691F" },
          handler: async (response: any) => {
            const { data: v } = await supabase.functions.invoke("razorpay-verify-payment", {
              body: response,
            });
            if (v?.valid) {
              toast.success("Payment successful! Order confirmed.");
              clear();
              setTimeout(() => navigate(u.user ? "/account" : "/"), 800);
            } else {
              toast.error("Payment verification failed. Contact support.");
            }
          },
          modal: { ondismiss: () => toast.info("Payment cancelled") },
        });
        rzp.open();
      } catch (err) {
        console.error(err);
        toast.error("Could not start Razorpay checkout. Try again.");
      }
      return;
    }

    const url = `https://wa.me/${SHOP_PHONE.replace("+", "")}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener");
    toast.success(u.user ? "Order saved — opening WhatsApp to confirm…" : "Opening WhatsApp to confirm your order…");
    clear();
    setTimeout(() => navigate(u.user ? "/account" : "/"), 800);
  };

  return (
    <Layout>
      <div className="container mx-auto pt-28 pb-16 max-w-5xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">No login needed. Place your order in seconds — we confirm on WhatsApp.</p>

        <form onSubmit={submit} className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-5">
            <div className="space-y-5 border border-border rounded-md p-6 bg-card">
              <h2 className="font-display text-lg uppercase font-bold">Contact</h2>
              <Row>
                <Field label="Full name (First and Last)"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} required /></Field>
                <Field label="Mobile number (10 digits)"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={10} required /></Field>
              </Row>
            </div>

            <div className="space-y-5 border border-border rounded-md p-6 bg-card">
              <h2 className="font-display text-lg uppercase font-bold">Delivery Address</h2>
              <Field label="Flat, House no., Building, Company, Apartment">
                <Input value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} maxLength={200} required />
              </Field>
              <Field label="Area, Street, Sector, Village">
                <Input value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} maxLength={200} required />
              </Field>
              <Field label="Landmark (optional)">
                <Input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} maxLength={100} placeholder="e.g. Near HDFC Bank" />
              </Field>
              <Row>
                <Field label="Pincode"><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} maxLength={6} required /></Field>
                <Field label="Town / City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={80} required /></Field>
              </Row>
              <Row>
                <Field label="State"><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} maxLength={80} required /></Field>
                <Field label="Delivery type">
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })}>
                    <option>Home Delivery</option>
                    <option>Store Pickup</option>
                  </select>
                </Field>
              </Row>
            </div>

            <div className="space-y-3 border border-border rounded-md p-6 bg-card">
              <h2 className="font-display text-lg uppercase font-bold">Payment Method</h2>
              <div className="space-y-2">
                {availableMethods.map((m) => (
                  <label key={m.id} className={`flex items-start gap-3 border rounded-md p-3 cursor-pointer transition-colors ${form.payment === m.id ? "border-signal bg-signal/5" : "border-border hover:border-signal/50"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={form.payment === m.id}
                      onChange={(e) => setForm({ ...form, payment: e.target.value })}
                      className="mt-1 accent-signal"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-charcoal">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              {!isB2B && profileLoaded && (
                <p className="text-[11px] text-muted-foreground pt-1">Manual order options (WhatsApp / COD) are available for verified B2B accounts. <a href="/auth" className="text-signal underline">Sign in as B2B</a></p>
              )}
            </div>

            <div className="space-y-5 border border-border rounded-md p-6 bg-card">
              <Field label="Order notes (optional)">
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} placeholder="Vehicle, part details, etc." />
              </Field>
            </div>


            <div className="border border-border rounded-md p-6 bg-card">
              <h2 className="font-display text-lg uppercase font-bold mb-3">Need help? Contact us directly</h2>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <a href={`tel:${SHOP_PHONE}`} className="flex items-center gap-2 hover:text-signal"><Phone size={16} className="text-signal" /> {SHOP_PHONE}</a>
                <a href={`https://wa.me/${SHOP_PHONE.replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-signal"><MessageCircle size={16} className="text-signal" /> WhatsApp</a>
                <a href={`mailto:${SHOP_EMAIL}`} className="flex items-center gap-2 hover:text-signal break-all"><Mail size={16} className="text-signal shrink-0" /> {SHOP_EMAIL}</a>
              </div>
            </div>
          </div>

          <aside className="border border-border rounded-md p-6 h-fit bg-card">
            <h2 className="font-display text-lg uppercase font-bold mb-4">Summary</h2>
            <div className="text-sm space-y-2 pb-4 border-b border-border">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between gap-2">
                  <span className="line-clamp-1">{i.qty} × {i.name}</span>
                  <span>₹{(i.qty * Number(i.price_inr)).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-baseline pt-4 mb-6">
              <span className="font-display text-lg uppercase">Total</span>
              <span className="font-display text-2xl font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <Button type="submit" size="lg" className="w-full bg-signal hover:bg-signal-deep text-white gap-2">
              <MessageCircle size={18} /> {form.payment === "razorpay" ? `Pay ₹${subtotal.toLocaleString("en-IN")} Securely` : "Place Order via WhatsApp"}
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {form.payment === "razorpay" ? "Secure payment via Razorpay (UPI, Cards, Netbanking, Wallets)." : "Our team confirms availability, payment & delivery on WhatsApp."}
            </p>
          </aside>
        </form>
      </div>
    </Layout>
  );
};

const Row = ({ children }: { children: React.ReactNode }) => <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</Label>{children}</div>
);

export default Checkout;
