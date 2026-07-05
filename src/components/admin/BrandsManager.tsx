import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { fileToDataUrl } from "@/lib/adminStore";

type Brand = { id: string; name: string; slug: string; logo_url: string | null };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const BrandsManager = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState({ name: "", slug: "", logo_url: "" });
  const [edits, setEdits] = useState<Record<string, Partial<Brand>>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [b, p] = await Promise.all([
      supabase.from("brands").select("id,name,slug,logo_url").order("name"),
      supabase.from("products").select("brand_id"),
    ]);
    setBrands((b.data as any) || []);
    const map: Record<string, number> = {};
    ((p.data as any) || []).forEach((r: any) => {
      if (r.brand_id) map[r.brand_id] = (map[r.brand_id] || 0) + 1;
    });
    setCounts(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFormImage = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast.error("Image too large (max 1.5 MB)");
    const data = await fileToDataUrl(file);
    setForm(f => ({ ...f, logo_url: data }));
  };

  const handleRowImage = async (id: string, file: File | undefined) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast.error("Image too large (max 1.5 MB)");
    updateField(id, "logo_url", await fileToDataUrl(file));
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return toast.error("Name required");
    const slug = (form.slug.trim() || slugify(name)).toLowerCase();
    if (brands.some(b => b.name.toLowerCase() === name.toLowerCase()))
      return toast.error(`Brand "${name}" already exists`);
    if (brands.some(b => b.slug.toLowerCase() === slug))
      return toast.error(`Slug "${slug}" already exists`);
    const { error } = await supabase.from("brands").insert({
      name, slug, logo_url: form.logo_url || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Brand added");
    setForm({ name: "", slug: "", logo_url: "" });
    load();
  };

  const updateField = (id: string, field: keyof Brand, value: any) =>
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const save = async (id: string) => {
    const patch = edits[id]; if (!patch) return;
    const { error } = await supabase.from("brands").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEdits(p => { const { [id]: _, ...rest } = p; return rest; });
    load();
  };

  const remove = async (id: string) => {
    if ((counts[id] || 0) > 0) return toast.error("Reassign products first");
    if (!confirm("Delete this brand? Its vehicle models will also be removed.")) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="space-y-4 p-6 border rounded-lg">
        <h2 className="font-display text-xl font-semibold uppercase flex items-center gap-2">
          <Plus size={18} /> Add Brand
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Slug (auto)</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.name)} /></div>
        </div>
        <div>
          <Label>Logo</Label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 h-10 border rounded-md cursor-pointer hover:bg-secondary">
              <Upload size={16} /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={e => handleFormImage(e.target.files?.[0])} />
            </label>
            <span className="text-xs text-muted-foreground">or paste URL (max 1.5 MB if uploading)</span>
          </div>
          <Input className="mt-2" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
          {form.logo_url && <img src={form.logo_url} alt="preview" className="mt-2 h-20 w-20 object-contain rounded border bg-white" />}
        </div>
        <Button type="submit">Add Brand</Button>
      </form>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-semibold uppercase">Brands ({brands.length})</h3>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="p-3">Logo</th>
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Products</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => {
                const dirty = !!edits[b.id];
                const v = { ...b, ...edits[b.id] };
                return (
                  <tr key={b.id} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {v.logo_url
                          ? <img src={v.logo_url} alt="" className="h-12 w-12 object-contain rounded bg-white border" />
                          : <div className="h-12 w-12 bg-muted rounded" />}
                        <label className="inline-flex items-center gap-1 px-2 h-8 border rounded cursor-pointer text-xs hover:bg-secondary">
                          <Upload size={12} />
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleRowImage(b.id, e.target.files?.[0])} />
                        </label>
                      </div>
                    </td>
                    <td className="p-3"><Input className="h-8" value={v.name} onChange={e => updateField(b.id, "name", e.target.value)} /></td>
                    <td className="p-3"><Input className="h-8" value={v.slug} onChange={e => updateField(b.id, "slug", e.target.value)} /></td>
                    <td className="p-3">{counts[b.id] || 0}</td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      {dirty && <Button size="sm" onClick={() => save(b.id)}><Save size={14} /></Button>}
                      <Button size="sm" variant="ghost" onClick={() => remove(b.id)}><Trash2 size={14} /></Button>
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

export default BrandsManager;
