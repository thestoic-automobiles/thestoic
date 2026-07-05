import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";

type Brand = { id: string; name: string };
type Model = { id: string; name: string; brand_id: string; vehicle_type: string; years: number[] };

const VEHICLE_TYPES = ["Car", "SUV", "Bike", "Truck"];

const parseYears = (s: string): number[] =>
  s.split(/[,\s]+/).map(t => parseInt(t, 10)).filter(n => !isNaN(n) && n > 1900 && n < 2100);

const VehicleModelsManager = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState({ name: "", brand_id: "", vehicle_type: "Car", years: "" });
  const [edits, setEdits] = useState<Record<string, { name?: string; brand_id?: string; vehicle_type?: string; years?: string }>>({});
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [b, m, p] = await Promise.all([
      supabase.from("brands").select("id,name").order("name"),
      supabase.from("vehicle_models").select("id,name,brand_id,vehicle_type,years").order("name"),
      supabase.from("products").select("model_id"),
    ]);
    setBrands((b.data as any) || []);
    setModels((m.data as any) || []);
    const map: Record<string, number> = {};
    ((p.data as any) || []).forEach((r: any) => {
      if (r.model_id) map[r.model_id] = (map[r.model_id] || 0) + 1;
    });
    setCounts(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const brandName = (id: string) => brands.find(b => b.id === id)?.name || "—";
  const filtered = useMemo(
    () => filterBrand === "all" ? models : models.filter(m => m.brand_id === filterBrand),
    [models, filterBrand]
  );

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return toast.error("Model name required");
    if (!form.brand_id) return toast.error("Select a brand");
    const years = parseYears(form.years);
    const { error } = await supabase.from("vehicle_models").insert({
      name, brand_id: form.brand_id, vehicle_type: form.vehicle_type, years,
    });
    if (error) return toast.error(error.message);
    toast.success("Model added");
    setForm({ name: "", brand_id: "", vehicle_type: "Car", years: "" });
    load();
  };

  const updateField = (id: string, field: string, value: any) =>
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const save = async (id: string) => {
    const patch = edits[id]; if (!patch) return;
    const out: any = { ...patch };
    if (typeof patch.years === "string") out.years = parseYears(patch.years);
    const { error } = await supabase.from("vehicle_models").update(out).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEdits(p => { const { [id]: _, ...rest } = p; return rest; });
    load();
  };

  const remove = async (id: string) => {
    if ((counts[id] || 0) > 0) return toast.error("Reassign products first");
    if (!confirm("Delete this model?")) return;
    const { error } = await supabase.from("vehicle_models").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="space-y-4 p-6 border rounded-lg">
        <h2 className="font-display text-xl font-semibold uppercase flex items-center gap-2">
          <Plus size={18} /> Add Vehicle Model
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Model Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Swift, Activa, etc." /></div>
          <div>
            <Label>Brand *</Label>
            <Select value={form.brand_id} onValueChange={v => setForm({ ...form, brand_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Vehicle Type</Label>
            <Select value={form.vehicle_type} onValueChange={v => setForm({ ...form, vehicle_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Years (comma separated)</Label>
            <Input value={form.years} onChange={e => setForm({ ...form, years: e.target.value })} placeholder="2018, 2019, 2020" />
          </div>
        </div>
        <Button type="submit">Add Model</Button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-display text-lg font-semibold uppercase">Models ({filtered.length})</h3>
          <div className="w-56">
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Type</th>
                <th className="p-3">Years</th>
                <th className="p-3">Products</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const e = edits[m.id] || {};
                const dirty = !!edits[m.id];
                const yearsStr = e.years ?? (m.years || []).join(", ");
                return (
                  <tr key={m.id} className="border-t">
                    <td className="p-3"><Input className="h-8" value={e.name ?? m.name} onChange={ev => updateField(m.id, "name", ev.target.value)} /></td>
                    <td className="p-3">
                      <Select value={e.brand_id ?? m.brand_id} onValueChange={v => updateField(m.id, "brand_id", v)}>
                        <SelectTrigger className="h-8"><SelectValue>{brandName(e.brand_id ?? m.brand_id)}</SelectValue></SelectTrigger>
                        <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select value={e.vehicle_type ?? m.vehicle_type} onValueChange={v => updateField(m.id, "vehicle_type", v)}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{VEHICLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="p-3"><Input className="h-8 w-40" value={yearsStr} onChange={ev => updateField(m.id, "years", ev.target.value)} /></td>
                    <td className="p-3">{counts[m.id] || 0}</td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      {dirty && <Button size="sm" onClick={() => save(m.id)}><Save size={14} /></Button>}
                      <Button size="sm" variant="ghost" onClick={() => remove(m.id)}><Trash2 size={14} /></Button>
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

export default VehicleModelsManager;
