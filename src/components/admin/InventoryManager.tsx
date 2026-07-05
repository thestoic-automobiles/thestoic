import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Plus, Save, Upload } from "lucide-react";
import { fileToDataUrl } from "@/lib/adminStore";

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price_inr: number;
  mrp_inr: number | null;
  discount_pct: number | null;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  brand_id: string | null;
  is_active: boolean;
  is_featured: boolean;
};

type Option = { id: string; name: string };

const empty = {
  sku: "", name: "", description: "",
  mrp_inr: 0, price_inr: 0, discount_pct: 0,
  stock: 0, image_url: "",
  category_id: "", brand_id: "", is_active: true, is_featured: false,
};

const InventoryManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);
  const [edits, setEdits] = useState<Record<string, Partial<Product>>>({});

  const load = async () => {
    setLoading(true);
    const [p, c, b] = await Promise.all([
      supabase.from("products").select("id,sku,name,description,price_inr,mrp_inr,discount_pct,stock,image_url,category_id,brand_id,is_active,is_featured").order("name"),
      supabase.from("part_categories").select("id,name").order("name"),
      supabase.from("brands").select("id,name").order("name"),
    ]);
    setProducts((p.data as any) || []);
    setCats((c.data as any) || []);
    setBrands((b.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-derive price from MRP & discount
  const recalcPrice = (mrp: number, pct: number) =>
    Math.max(0, Math.round((mrp - mrp * (pct / 100)) * 100) / 100);

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleFormImage = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast.error("Image too large (max 1.5 MB)");
    setForm(f => ({ ...f, image_url: "" }));
    const data = await fileToDataUrl(file);
    setForm(f => ({ ...f, image_url: data }));
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku.trim() || !form.name.trim()) return toast.error("SKU and name required");
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description || null,
      mrp_inr: Number(form.mrp_inr) || null,
      discount_pct: Number(form.discount_pct) || 0,
      price_inr: Number(form.price_inr) || 0,
      stock: Number(form.stock) || 0,
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      compatible_model_ids: [],
    };
    const { error } = await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Product added");
    setForm(empty);
    load();
  };

  const updateField = (id: string, field: keyof Product, value: any) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveRow = async (id: string) => {
    const patch = edits[id];
    if (!patch) return;
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEdits(prev => { const { [id]: _, ...rest } = prev; return rest; });
    load();
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={addProduct} onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault(); }} className="space-y-4 p-6 border rounded-lg">
        <h2 className="font-display text-xl font-semibold uppercase flex items-center gap-2">
          <Plus size={18} /> Add Product
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>SKU *</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
          <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>

          <div>
            <Label>MRP (₹)</Label>
            <Input type="number" min="0" step="0.01" value={form.mrp_inr}
              onChange={e => {
                const mrp = +e.target.value;
                setForm({ ...form, mrp_inr: mrp, price_inr: recalcPrice(mrp, form.discount_pct) });
              }} />
          </div>
          <div>
            <Label>Discount (%)</Label>
            <Input type="number" min="0" max="100" step="0.1" value={form.discount_pct}
              onChange={e => {
                const pct = +e.target.value;
                setForm({ ...form, discount_pct: pct, price_inr: recalcPrice(form.mrp_inr, pct) });
              }} />
          </div>
          <div>
            <Label>Selling Price (₹) *</Label>
            <Input type="number" min="0" step="0.01" value={form.price_inr}
              onChange={e => setForm({ ...form, price_inr: +e.target.value })} required />
          </div>
          <div><Label>Stock</Label><Input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} /></div>

          <div>
            <Label>Category</Label>
            <select className="w-full border rounded-md h-10 px-3 bg-background" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              <option value="">— None —</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Brand</Label>
            <select className="w-full border rounded-md h-10 px-3 bg-background" value={form.brand_id} onChange={e => setForm({ ...form, brand_id: e.target.value })}>
              <option value="">— None —</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <Label>Product Image</Label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 h-10 border rounded-md cursor-pointer hover:bg-secondary">
                <Upload size={16} /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFormImage(e.target.files?.[0])} />
              </label>
              <span className="text-xs text-muted-foreground">or paste URL below (max 1.5 MB if uploading)</span>
            </div>
            <Input className="mt-2" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-24 w-24 object-cover rounded border" />}
          </div>

          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            Active (visible in shop)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
            Featured / Best Seller (show on homepage)
          </label>
        </div>
        <Button type="button" onClick={(e) => addProduct(e as any)}>Add Product</Button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-semibold uppercase">Inventory ({filtered.length})</h3>
          <Input placeholder="Search by name or SKU" value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">SKU</th>
                <th className="p-3 min-w-[200px]">Name</th>
                <th className="p-3">MRP</th>
                <th className="p-3">Disc%</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Active</th>
                <th className="p-3">Featured</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const dirty = !!edits[p.id];
                const v = { ...p, ...edits[p.id] };
                return (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">
                      {v.image_url ? <img src={v.image_url} alt="" className="h-12 w-12 object-cover rounded" /> : <div className="h-12 w-12 bg-muted rounded" />}
                    </td>
                    <td className="p-3 font-mono text-xs">{p.sku}</td>
                    <td className="p-3"><Input value={v.name} onChange={e => updateField(p.id, "name", e.target.value)} className="h-8" /></td>
                    <td className="p-3"><Input type="number" step="0.01" value={v.mrp_inr ?? ""} onChange={e => updateField(p.id, "mrp_inr", e.target.value === "" ? null : +e.target.value)} className="h-8 w-24" /></td>
                    <td className="p-3"><Input type="number" step="0.1" value={v.discount_pct ?? 0} onChange={e => updateField(p.id, "discount_pct", +e.target.value)} className="h-8 w-20" /></td>
                    <td className="p-3"><Input type="number" step="0.01" value={v.price_inr} onChange={e => updateField(p.id, "price_inr", +e.target.value)} className="h-8 w-24" /></td>
                    <td className="p-3"><Input type="number" value={v.stock} onChange={e => updateField(p.id, "stock", +e.target.value)} className="h-8 w-20" /></td>
                    <td className="p-3"><input type="checkbox" checked={v.is_active} onChange={e => updateField(p.id, "is_active", e.target.checked)} /></td>
                    <td className="p-3"><input type="checkbox" checked={!!v.is_featured} onChange={e => updateField(p.id, "is_featured", e.target.checked)} /></td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      {dirty && <Button size="sm" onClick={() => saveRow(p.id)}><Save size={14} /></Button>}
                      <Button size="sm" variant="ghost" onClick={() => deleteRow(p.id)}><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
