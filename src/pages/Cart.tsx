import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, setQty, remove, subtotal, count } = useCart();

  return (
    <Layout>
      <SEO title="Your Cart" description="Review the spare parts in your cart and continue to secure checkout." path="/cart" noindex />
      <div className="container mx-auto pt-28 pb-16">
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-md">
            <ShoppingBag size={36} className="mx-auto text-steel mb-4" />
            <p className="font-display text-2xl uppercase">Your cart is empty</p>
            <Button asChild className="mt-6 bg-signal hover:bg-signal-deep text-white"><Link to="/shop">Browse parts</Link></Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="border border-border rounded-md divide-y divide-border">
              {items.map((i) => (
                <div key={i.id} className="p-4 flex gap-4 items-center">
                  <div className="h-20 w-20 bg-secondary rounded-sm shrink-0 flex items-center justify-center text-steel font-display text-xs">{i.image_url ? <img src={i.image_url} alt={i.name} className="w-full h-full object-cover rounded-sm" /> : "PART"}</div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${i.id}`} className="font-display font-semibold hover:text-signal line-clamp-1">{i.name}</Link>
                    <p className="text-sm text-muted-foreground">₹{Number(i.price_inr).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center border border-border rounded-md">
                    <button onClick={() => setQty(i.id, i.qty - 1)} className="px-2 py-1">−</button>
                    <span className="px-3 text-sm font-semibold">{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} className="px-2 py-1">+</button>
                  </div>
                  <p className="font-semibold w-24 text-right">₹{(i.qty * Number(i.price_inr)).toLocaleString("en-IN")}</p>
                  <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive p-2" aria-label="Remove"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <aside className="border border-border rounded-md p-6 h-fit bg-card">
              <h2 className="font-display text-lg font-bold uppercase mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm pb-4 border-b border-border">
                <div className="flex justify-between"><span>Items ({count})</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Calculated at checkout</span></div>
              </div>
              <div className="flex justify-between items-baseline pt-4 mb-6">
                <span className="font-display text-lg uppercase">Total</span>
                <span className="font-display text-2xl font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <Button asChild size="lg" className="w-full bg-signal hover:bg-signal-deep text-white"><Link to="/checkout">Proceed to Checkout</Link></Button>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
