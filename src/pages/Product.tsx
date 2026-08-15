import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SEO, { SITE_URL } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ChevronRight, ShoppingCart, BadgeCheck, Truck, Zap, ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type P = {
  id: string; sku: string; name: string; description: string | null; price_inr: number;
  stock: number; image_url: string | null; mfg_year: number | null;
  brand: { name: string } | null; category: { name: string } | null;
};

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<P | null>(null);
  const [qty, setQty] = useState(1);
  const [imgFailed, setImgFailed] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id,sku,name,description,price_inr,stock,image_url,mfg_year,brand:brands(name),category:part_categories(name)")
        .eq("id", id).maybeSingle();
      setP(data as any);
      const hasValid = Boolean(
        data?.image_url &&
        !data.image_url.startsWith("/__l5e") &&
        (data.image_url.startsWith("http://") || data.image_url.startsWith("https://") || data.image_url.startsWith("data:") || data.image_url.startsWith("/assets/"))
      );
      setImgFailed(!hasValid);
    })();
  }, [id]);

  if (!p) return <Layout><div className="container mx-auto py-32 text-center">Loading…</div></Layout>;

  return (
    <Layout>
      <SEO
        title={`${p.name}${p.brand?.name ? ` — ${p.brand.name}` : ""}`}
        description={(p.description || `Buy genuine ${p.name}${p.brand?.name ? ` by ${p.brand.name}` : ""}. SKU ${p.sku}. In stock, GST invoice, pan-India dispatch.`).slice(0, 160)}
        path={`/product/${p.id}`}
        image={!imgFailed && p.image_url ? p.image_url : undefined}
        type="product"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            sku: p.sku,
            description: p.description || `${p.name} — genuine spare part.`,
            image: !imgFailed && p.image_url ? p.image_url : undefined,
            brand: p.brand?.name ? { "@type": "Brand", name: p.brand.name } : undefined,
            category: p.category?.name,
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/product/${p.id}`,
              priceCurrency: "INR",
              price: Number(p.price_inr),
              availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
              { "@type": "ListItem", position: 3, name: p.name, item: `${SITE_URL}/product/${p.id}` },
            ],
          },
        ]}
      />
      <div className="container mx-auto pt-28 pb-16">
        <nav className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-6">
          <Link to="/" className="hover:text-signal">Home</Link><ChevronRight size={12} />
          <Link to="/shop" className="hover:text-signal">Shop</Link><ChevronRight size={12} />
          <span className="text-charcoal truncate">{p.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-white border border-border rounded-xl flex items-center justify-center p-8 overflow-hidden shadow-sm">
            {!imgFailed && p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                onError={() => setImgFailed(true)}
                loading="lazy"
                className="w-full h-full object-contain rounded-md"
              />
            ) : (
              <div className="w-full h-full relative rounded-md overflow-hidden flex items-center justify-center">
                <Skeleton className="w-full h-full absolute inset-0" />
                <div className="relative z-10 flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
                  <ImageOff size={36} className="stroke-[1.5]" />
                  <span className="text-xs font-mono uppercase tracking-widest">{p.sku}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-signal font-semibold mb-2">{p.brand?.name || "Universal"} • {p.category?.name}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-charcoal mb-3">{p.name}</h1>
            <p className="text-sm text-muted-foreground mb-6">SKU: <span className="font-mono">{p.sku}</span>{p.mfg_year && <> • Mfg Year: <strong>{p.mfg_year}</strong></>}</p>
            <p className="font-display text-4xl font-bold text-charcoal mb-2">₹{Number(p.price_inr).toLocaleString("en-IN")}</p>
            <p className={`text-sm mb-6 ${p.stock > 0 ? "text-green-700" : "text-destructive"}`}>{p.stock > 0 ? `In stock (${p.stock} available)` : "Out of stock"}</p>

            <p className="text-foreground/80 leading-relaxed mb-8">{p.description}</p>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center border border-border rounded-md">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-lg">−</button>
                <span className="px-4 font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} className="px-3 py-2 text-lg">+</button>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 sm:flex-initial"
                disabled={p.stock <= 0}
                onClick={() => {
                  add({ id: p.id, name: p.name, price_inr: Number(p.price_inr), image_url: p.image_url }, qty);
                  toast.success(`Added ${qty} × ${p.name}`);
                }}
              >
                <ShoppingCart size={18} /> Add to Cart
              </Button>
              <Button
                size="lg"
                className="bg-signal hover:bg-signal-deep text-white flex-1 sm:flex-initial"
                disabled={p.stock <= 0}
                onClick={() => {
                  add({ id: p.id, name: p.name, price_inr: Number(p.price_inr), image_url: p.image_url }, qty);
                  navigate("/checkout");
                }}
              >
                <Zap size={18} /> Buy Now
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><BadgeCheck size={16} className="text-signal" /> Genuine guarantee</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Truck size={16} className="text-signal" /> Ships pan-India</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Product;
