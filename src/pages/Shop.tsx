import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PartSearch from "@/components/PartSearch";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";

type Product = ProductCardData & {
  category_id: string | null;
  brand_id: string | null;
  compatible_model_ids: string[];
};

const Shop = () => {
  const [params] = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const brand = params.get("brand");
  const model = params.get("model");
  const category = params.get("category");
  const year = params.get("year");

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase
        .from("products")
        .select("id,sku,name,price_inr,stock,image_url,mfg_year,category_id,brand_id,compatible_model_ids,brand:brands(name)")
        .eq("is_active", true)
        .order("name");
      if (brand) query = query.eq("brand_id", brand);
      if (category) query = query.eq("category_id", category);
      if (model) query = query.contains("compatible_model_ids", [model]);
      if (year) query = query.eq("mfg_year", Number(year));
      const { data } = await query;
      setItems((data as any) || []);
      setLoading(false);
    })();
  }, [brand, model, category, year]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter((p) => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
  }, [items, q]);

  return (
    <Layout>
      <SEO
        title="Shop Auto Spare Parts — Cars & Bikes"
        description="Browse 10,000+ genuine OEM auto spare parts. Filter by brand, vehicle, category or year. Fast dispatch across India with GST invoicing."
        path="/shop"
      />

      <section className="pt-28 pb-10 bg-charcoal-deep text-primary-foreground">
        <div className="container mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">Spare Parts Catalog</h1>
          <p className="text-primary-foreground/70 mt-2">Narrow down by brand, vehicle or part category.</p>
        </div>
      </section>

      <section className="-mt-4 container mx-auto relative z-10">
        <PartSearch />
      </section>

      <section className="container mx-auto py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${filtered.length} part${filtered.length === 1 ? "" : "s"} found`}</p>
          <Input placeholder="Filter results by name or SKU" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        </div>
        {filtered.length === 0 && !loading ? (
          <div className="text-center py-20 border border-dashed border-border rounded-md">
            <p className="font-display text-2xl uppercase text-charcoal">No parts match your filters</p>
            <p className="text-muted-foreground text-sm mt-2">Try widening your search above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Shop;
