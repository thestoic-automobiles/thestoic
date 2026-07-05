import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { fileToDataUrl } from "@/lib/adminStore";

type Category = { id: string; name: string; slug: string; icon: string | null; image_url: string | null };

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CategoriesManager = () => {
  const [cats, setCats] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState({ name: "", slug: "", icon: "", image_url: "" });
  const [edits, setEdits] = useState<Record<string, Partial<Category>>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([
      supabase.from("part_categories").select("id,name,slug,icon,image_url").order("name"),
      supabase.from("products").select("category_id"),
    ]);
    setCats((c.data as any) || []);
    const map: Record<string, number> = {};
    ((p.data as any) || []).forEach((r: any) => {
      if (r.category_id) map[r.category_id] = (map[r.category_id] || 0) + 1;
    });
    setCounts(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleFormImage = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast.error("Image too large (max 1.5 MB)");
    const data = await fileToDataUrl(file);
    setForm(f => ({ ...f, image_url: data }));
  };

  const handleRowImage = async (id: string, file: File | undefined) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return toast.error("Image too large (max 1.5 MB)");
    const data = await fileToDataUrl(file);
    updateField(id, "image_url", data);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return toast.error("Name required");
    const slug = (form.slug.trim() || slugify(name)).toLowerCase();
    const nameLc = name.toLowerCase();
    if (cats.some(c => c.name.toLowerCase() === nameLc))
      return toast.error(`Category "${name}" already exists`);
    if (cats.some(c => c.slug.toLowerCase() === slug))
      return toast.error(`Slug "${slug}" already exists — choose a different one`);
    const { error } = await supabase.from("part_categories").insert({
      name, slug, icon: form.icon || null, image_url: form.image_url || null,
    });
    if (error) {
      if (error.code === "23505")
        return toast.error("A category with this name or slug already exists");
      return toast.error(error.message);
    }
    toast.success("Category added");
    setForm({ name: "", slug: "", icon: "", image_url: "" });
    load();
  };

  const updateField = (id: string, field: keyof Category, value: any) =>
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const save = async (id: string) => {
    const patch = edits[id]; if (!patch) return;
    const { error } = await supabase.from("part_categories").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEdits(p => { const { [id]: _, ...rest } = p; return rest; });
    load();
  };

  const remove = async (id: string) => {
    if ((counts[id] || 0) > 0) return toast.error("Reassign products first");
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("part_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="space-y-4 p-6 border rounded-lg">
        <h2 className="font-display text-xl font-semibold uppercase flex items-center gap-2">
          <Plus size={18} /> Add Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Slug (auto)</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.name)} /></div>
          <div><Label>Icon (emoji, optional)</Label><Input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} /></div>
        </div>
        <div>
          <Label>Category Image</Label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 h-10 border rounded-md cursor-pointer hover:bg-secondary">
              <Upload size={16} /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={e => handleFormImage(e.target.files?.[0])} />
            </label>
            <span className="text-xs text-muted-foreground">or paste URL (max 1.5 MB if uploading)</span>
          </div>
          <Input className="mt-2" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-24 w-24 object-cover rounded border" />}
        </div>
        <Button type="submit">Add Category</Button>
      </form>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-semibold uppercase">Categories ({cats.length})</h3>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Icon</th>
                <th className="p-3">Products</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(c => {
                const dirty = !!edits[c.id];
                const v = { ...c, ...edits[c.id] };
                return (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {v.image_url
                          ? <img src={v.image_url} alt="" className="h-12 w-12 object-cover rounded" />
                          : <div className="h-12 w-12 bg-muted rounded" />}
                        <label className="inline-flex items-center gap-1 px-2 h-8 border rounded cursor-pointer text-xs hover:bg-secondary">
                          <Upload size={12} />
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleRowImage(c.id, e.target.files?.[0])} />
                        </label>
                      </div>
                    </td>
                    <td className="p-3"><Input className="h-8" value={v.name} onChange={e => updateField(c.id, "name", e.target.value)} /></td>
                    <td className="p-3"><Input className="h-8" value={v.slug} onChange={e => updateField(c.id, "slug", e.target.value)} /></td>
                    <td className="p-3"><Input className="h-8 w-24" value={v.icon ?? ""} onChange={e => updateField(c.id, "icon", e.target.value)} /></td>
                    <td className="p-3">{counts[c.id] || 0}</td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      {dirty && <Button size="sm" onClick={() => save(c.id)}><Save size={14} /></Button>}
                      <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 size={14} /></Button>
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

export default CategoriesManager;
