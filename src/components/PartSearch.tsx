import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

type Brand = { id: string; name: string };
type Model = { id: string; name: string; brand_id: string; vehicle_type: string; years: number[] };
type Category = { id: string; name: string; slug: string };

const TABS = [
  { key: "brand", label: "By Brand" },
  { key: "vehicle", label: "By Vehicle" },
  { key: "category", label: "By Part" },
  { key: "manufacturer", label: "By Part Manufacturer" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const PartSearch = ({ initialTab = "brand" as TabKey }) => {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [vtype, setVtype] = useState<string>("");
  const [cat, setCat] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const [b, m, c] = await Promise.all([
        supabase.from("brands").select("id,name").order("name"),
        supabase.from("vehicle_models").select("id,name,brand_id,vehicle_type,years"),
        supabase.from("part_categories").select("id,name,slug").order("name"),
      ]);
      setBrands(b.data || []);
      setModels(m.data || []);
      setCats(c.data || []);
    })();
  }, []);

  const filteredModels = useMemo(
    () => models.filter((mm) => (!brand || mm.brand_id === brand) && (!vtype || mm.vehicle_type === vtype)),
    [models, brand, vtype],
  );
  const years = useMemo(() => {
    const mm = models.find((m) => m.id === model);
    return mm?.years || [];
  }, [models, model]);

  const submit = () => {
    const q = new URLSearchParams();
    if (brand) q.set("brand", brand);
    if (model) q.set("model", model);
    if (year) q.set("year", year);
    if (cat) q.set("category", cat);
    if (vtype) q.set("vtype", vtype);
    navigate(`/shop?${q.toString()}`);
  };

  return (
    <div className="bg-background border-2 border-border shadow-xl rounded-md">
      <div className="flex flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 min-w-[50%] sm:min-w-0 py-3 px-2 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors ${
              tab === t.key ? "bg-charcoal text-primary-foreground" : "bg-secondary text-charcoal hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        {tab === "brand" && (
          <>
            <Field label="Brand">
              <Select value={brand} onValueChange={(v) => { setBrand(v); setModel(""); }}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Model">
              <Select value={model} onValueChange={setModel} disabled={!brand}>
                <SelectTrigger><SelectValue placeholder={brand ? "Select model" : "Pick brand first"} /></SelectTrigger>
                <SelectContent>{filteredModels.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Part Category">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger><SelectValue placeholder="Any category" /></SelectTrigger>
                <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Button onClick={submit} size="lg" className="bg-signal hover:bg-signal-deep text-white"><Search size={16} /> Search</Button>
          </>
        )}

        {tab === "vehicle" && (
          <>
            <Field label="Vehicle Type">
              <Select value={vtype} onValueChange={(v) => { setVtype(v); setModel(""); }}>
                <SelectTrigger><SelectValue placeholder="Car / Bike / SUV / Truck" /></SelectTrigger>
                <SelectContent>
                  {["Car", "SUV", "Bike", "Truck"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Model">
              <Select value={model} onValueChange={(v) => { setModel(v); setYear(""); }}>
                <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                  {filteredModels.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No models available</div>
                  ) : filteredModels.map((m) => {
                    const bn = brands.find((b) => b.id === m.brand_id)?.name || "";
                    return <SelectItem key={m.id} value={m.id}>{bn} {m.name}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Year">
              <Select value={year} onValueChange={setYear} disabled={!model}>
                <SelectTrigger><SelectValue placeholder={model ? "Select year" : "Pick model first"} /></SelectTrigger>
                <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Button onClick={submit} size="lg" className="bg-signal hover:bg-signal-deep text-white"><Search size={16} /> Search</Button>
          </>
        )}

        {tab === "category" && (
          <>
            <Field label="Part Category">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Brand (optional)">
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue placeholder="Any brand" /></SelectTrigger>
                <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div />
            <Button onClick={submit} size="lg" className="bg-signal hover:bg-signal-deep text-white"><Search size={16} /> Search</Button>
          </>
        )}

        {tab === "manufacturer" && (
          <>
            <Field label="Part Manufacturer">
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue placeholder="Select manufacturer (Bosch, Denso, etc.)" /></SelectTrigger>
                <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Part Category (optional)">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger><SelectValue placeholder="Any category" /></SelectTrigger>
                <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div />
            <Button onClick={submit} size="lg" className="bg-signal hover:bg-signal-deep text-white"><Search size={16} /> Search</Button>
          </>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

export default PartSearch;
