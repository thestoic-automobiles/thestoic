import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Save,
  Upload,
} from "lucide-react";
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

  // New database structure
  brand_list: string[];
  compatible_model_ids: string[];

  manufacturer: string | null;

  is_active: boolean;
  is_featured: boolean;
};

type Option = {
  id: string;
  name: string;
};

type VehicleModelOption = {
  id: string;
  name: string;
  brand_id: string;
};

const empty = {
  sku: "",
  name: "",
  description: "",
  mrp_inr: 0,
  price_inr: 0,
  discount_pct: 0,
  stock: 0,
  image_url: "",
  category_id: "",

  brand_list: [] as string[],
  compatible_model_ids: [] as string[],

  manufacturer: "",

  is_active: true,
  is_featured: false,
};

const InventoryManager = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [cats, setCats] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);

  // All vehicle models from database.
  // They are filtered by brand when displayed.
  const [vehicleModels, setVehicleModels] = useState<
    VehicleModelOption[]
  >([]);

  // Models displayed in ADD PRODUCT form
  const [compatibleModels, setCompatibleModels] = useState<
    VehicleModelOption[]
  >([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<typeof empty>(empty);

  const [edits, setEdits] = useState<
    Record<string, Partial<Product>>
  >({});

  // =========================================================
  // LOAD DATA
  // =========================================================

  const load = async () => {
    setLoading(true);

    try {
      const [p, c, b, vm] = await Promise.all([
        // PRODUCTS
        supabase
          .from("products")
          .select(`
            id,
            sku,
            name,
            description,
            price_inr,
            mrp_inr,
            discount_pct,
            stock,
            image_url,
            category_id,
            brand_list,
            compatible_model_ids,
            manufacturer,
            is_active,
            is_featured
          `)
          .order("name"),

        // CATEGORIES
        supabase
          .from("part_categories")
          .select("id,name")
          .order("name"),

        // BRANDS
        supabase
          .from("brands")
          .select("id,name")
          .order("name"),

        // ALL VEHICLE MODELS
        supabase
          .from("vehicle_models")
          .select("id,name,brand_id")
          .order("name"),
      ]);

      if (p.error) {
        console.error("Products loading error:", p.error);
        toast.error(p.error.message);
      }

      if (c.error) {
        console.error("Categories loading error:", c.error);
      }

      if (b.error) {
        console.error("Brands loading error:", b.error);
      }

      if (vm.error) {
        console.error(
          "Vehicle models loading error:",
          vm.error
        );
        toast.error(vm.error.message);
      }

      setProducts((p.data as Product[]) || []);
      setCats((c.data as Option[]) || []);
      setBrands((b.data as Option[]) || []);
      setVehicleModels(
        (vm.data as VehicleModelOption[]) || []
      );
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================================================
  // LOAD VEHICLE MODELS FOR ADD FORM
  // =========================================================

  const loadCompatibleModels = async (
    brandIds: string[]
  ) => {
    if (brandIds.length === 0) {
      setCompatibleModels([]);

      setForm((prev) => ({
        ...prev,
        compatible_model_ids: [],
      }));

      return;
    }

    const { data, error } = await supabase
      .from("vehicle_models")
      .select("id,name,brand_id")
      .in("brand_id", brandIds)
      .order("name");

    if (error) {
      console.error(
        "Vehicle models loading error:",
        error
      );
      toast.error(error.message);
      return;
    }

    const models =
      (data as VehicleModelOption[]) || [];

    setCompatibleModels(models);

    // Remove models that no longer belong
    // to selected brands.
    setForm((prev) => ({
      ...prev,
      compatible_model_ids:
        prev.compatible_model_ids.filter(
          (modelId) =>
            models.some(
              (model) => model.id === modelId
            )
        ),
    }));
  };

  // =========================================================
  // AUTO DERIVE PRICE
  // =========================================================

  const recalcPrice = (
    mrp: number,
    pct: number
  ) =>
    Math.max(
      0,
      Math.round(
        (mrp - mrp * (pct / 100)) * 100
      ) / 100
    );

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      p.sku
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // =========================================================
  // GET BRAND NAME
  // =========================================================

  const getBrandName = (brandId: string) => {
    return (
      brands.find(
        (brand) => brand.id === brandId
      )?.name || "Unknown Brand"
    );
  };

  // =========================================================
  // GET MODEL NAME
  // =========================================================

  const getModelName = (modelId: string) => {
    return (
      vehicleModels.find((model) => model.id === modelId)?.name || "Unknown Model"
    );
  };

  // =========================================================
  // GET MODELS FOR SELECTED BRANDS
  // =========================================================

  const getModelsForBrands = (
    brandIds: string[]
  ) => {
    if (brandIds.length === 0) {
      return [];
    }

    return vehicleModels.filter(
      (model) =>
        brandIds.includes(model.brand_id)
    );
  };

  // =========================================================
  // ADD PRODUCT IMAGE
  // =========================================================

  const handleFormImage = async (
    file: File | undefined
  ) => {
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      return toast.error(
        "Image too large (max 1.5 MB)"
      );
    }

    try {
      setForm((f) => ({
        ...f,
        image_url: "",
      }));

      const data = await fileToDataUrl(file);

      setForm((f) => ({
        ...f,
        image_url: data,
      }));
    } catch (error) {
      console.error(
        "Image conversion failed:",
        error
      );

      toast.error(
        "Failed to process image"
      );
    }
  };

  // =========================================================
  // UPDATE PRODUCT IMAGE FROM TABLE
  // =========================================================

  const handleRowImage = async (
    id: string,
    file: File | undefined
  ) => {
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      return toast.error(
        "Image too large (max 1.5 MB)"
      );
    }

    try {
      const data = await fileToDataUrl(file);

      updateField(
        id,
        "image_url",
        data
      );

      toast.success(
        "Image selected. Click Save to update."
      );
    } catch (error) {
      console.error(
        "Image conversion failed:",
        error
      );

      toast.error(
        "Failed to process image"
      );
    }
  };

  // =========================================================
  // TOGGLE BRAND - ADD FORM
  // =========================================================

  const toggleBrand = async (
    brandId: string
  ) => {
    const newBrandList =
      form.brand_list.includes(brandId)
        ? form.brand_list.filter(
            (id) => id !== brandId
          )
        : [
            ...form.brand_list,
            brandId,
          ];

    setForm((prev) => ({
      ...prev,
      brand_list: newBrandList,
    }));

    await loadCompatibleModels(
      newBrandList
    );
  };

  // =========================================================
  // TOGGLE MODEL - ADD FORM
  // =========================================================

  const toggleCompatibleModel = (
    modelId: string
  ) => {
    setForm((prev) => {
      const exists =
        prev.compatible_model_ids.includes(
          modelId
        );

      return {
        ...prev,
        compatible_model_ids:
          exists
            ? prev.compatible_model_ids.filter(
                (id) =>
                  id !== modelId
              )
            : [
                ...prev.compatible_model_ids,
                modelId,
              ],
      };
    });
  };

  // =========================================================
  // TOGGLE BRAND - TABLE ROW
  // =========================================================

  const toggleRowBrand = (
    productId: string,
    currentBrands: string[],
    brandId: string
  ) => {
    const newBrandList =
      currentBrands.includes(brandId)
        ? currentBrands.filter(
            (id) => id !== brandId
          )
        : [
            ...currentBrands,
            brandId,
          ];

    // Models that belong to currently
    // selected brands
    const allowedModels =
      getModelsForBrands(
        newBrandList
      );

    const allowedModelIds =
      allowedModels.map(
        (model) => model.id
      );

    // Keep only selected models which
    // still belong to selected brands.
    const currentModelIds =
      getCurrentRowModelIds(
        productId
      );

    const newModelIds =
      currentModelIds.filter(
        (modelId) =>
          allowedModelIds.includes(
            modelId
          )
      );

    setEdits((prev) => ({
      ...prev,

      [productId]: {
        ...prev[productId],

        brand_list:
          newBrandList,

        compatible_model_ids:
          newModelIds,
      },
    }));
  };

  // =========================================================
  // GET CURRENT ROW MODEL IDS
  // =========================================================

  const getCurrentRowModelIds = (
    productId: string
  ): string[] => {
    const product = products.find(
      (p) => p.id === productId
    );

    const edit = edits[productId];

    return (
      (edit?.compatible_model_ids ??
        product?.compatible_model_ids ??
        []) as string[]
    );
  };

  // =========================================================
  // TOGGLE MODEL - TABLE ROW
  // =========================================================

  const toggleRowModel = (
    productId: string,
    modelId: string
  ) => {
    const currentModelIds =
      getCurrentRowModelIds(
        productId
      );

    const newModelIds =
      currentModelIds.includes(modelId)
        ? currentModelIds.filter(
            (id) => id !== modelId
          )
        : [
            ...currentModelIds,
            modelId,
          ];

    updateField(
      productId,
      "compatible_model_ids",
      newModelIds
    );
  };

  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const addProduct = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.sku.trim() ||
      !form.name.trim()
    ) {
      return toast.error(
        "SKU and name required"
      );
    }

    if (
      form.brand_list.length === 0
    ) {
      return toast.error(
        "Please select at least one brand"
      );
    }

    if (
      form.compatible_model_ids
        .length === 0
    ) {
      return toast.error(
        "Please select at least one compatible model"
      );
    }

    const payload = {
      sku: form.sku.trim(),

      name: form.name.trim(),

      description:
        form.description || null,

      mrp_inr:
        Number(form.mrp_inr) || null,

      discount_pct:
        Number(form.discount_pct) || 0,

      price_inr:
        Number(form.price_inr) || 0,

      stock:
        Number(form.stock) || 0,

      image_url:
        form.image_url || null,

      category_id:
        form.category_id || null,

      brand_list:
        form.brand_list,

      compatible_model_ids:
        form.compatible_model_ids,

      manufacturer:
        form.manufacturer.trim() ||
        null,

      is_active:
        form.is_active,

      is_featured:
        form.is_featured,
    };

    const { error } =
      await supabase
        .from("products")
        .insert(payload);

    if (error) {
      console.error(
        "Product insert error:",
        error
      );

      return toast.error(
        error.message
      );
    }

    toast.success(
      "Product added"
    );

    setForm({
      ...empty,
      brand_list: [],
      compatible_model_ids: [],
    });

    setCompatibleModels([]);

    load();
  };

  // =========================================================
  // UPDATE ROW FIELD
  // =========================================================

  const updateField = (
    id: string,
    field: keyof Product,
    value: any
  ) => {
    setEdits((prev) => ({
      ...prev,

      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // =========================================================
  // SAVE ROW
  // =========================================================

  const saveRow = async (
    id: string
  ) => {
    const patch = edits[id];

    if (!patch) return;

    // Require brand
    if (
      "brand_list" in patch &&
      Array.isArray(
        patch.brand_list
      ) &&
      patch.brand_list.length === 0
    ) {
      return toast.error(
        "Product must have at least one brand"
      );
    }

    // Require compatible model
    if (
      "compatible_model_ids" in
        patch &&
      Array.isArray(
        patch.compatible_model_ids
      ) &&
      patch.compatible_model_ids
        .length === 0
    ) {
      return toast.error(
        "Product must have at least one compatible model"
      );
    }

    const { error } =
      await supabase
        .from("products")
        .update(patch)
        .eq("id", id);

    if (error) {
      console.error(
        "Product update error:",
        error
      );

      return toast.error(
        error.message
      );
    }

    toast.success("Saved");

    setEdits((prev) => {
      const {
        [id]: _,
        ...rest
      } = prev;

      return rest;
    });

    load();
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const deleteRow = async (
    id: string
  ) => {
    if (
      !confirm(
        "Delete this product?"
      )
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
      return toast.error(
        error.message
      );
    }

    toast.success("Deleted");

    load();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-8">

      {/* =====================================================
          ADD PRODUCT
      ====================================================== */}

      <form
        onSubmit={addProduct}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            (e.target as HTMLElement)
              .tagName !== "TEXTAREA"
          ) {
            e.preventDefault();
          }
        }}
        className="space-y-4 p-6 border rounded-lg"
      >

        <h2 className="font-display text-xl font-semibold uppercase flex items-center gap-2">
          <Plus size={18} />
          Add Product
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* SKU */}
          <div>
            <Label>
              SKU *
            </Label>

            <Input
              value={form.sku}
              onChange={(e) =>
                setForm({
                  ...form,
                  sku: e.target.value,
                })
              }
              required
            />
          </div>

          {/* NAME */}
          <div>
            <Label>
              Name *
            </Label>

            <Input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />
          </div>

          {/* MANUFACTURER */}
          <div>
            <Label>
              Manufacturer
            </Label>

            <Input
              value={
                form.manufacturer
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  manufacturer:
                    e.target.value,
                })
              }
              placeholder="Enter manufacturer"
            />
          </div>

          {/* MRP */}
          <div>
            <Label>
              MRP (₹)
            </Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.mrp_inr}
              onChange={(e) => {
                const mrp =
                  +e.target.value;

                setForm({
                  ...form,
                  mrp_inr: mrp,
                  price_inr:
                    recalcPrice(
                      mrp,
                      form.discount_pct
                    ),
                });
              }}
            />
          </div>

          {/* DISCOUNT */}
          <div>
            <Label>
              Discount (%)
            </Label>

            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={
                form.discount_pct
              }
              onChange={(e) => {
                const pct =
                  +e.target.value;

                setForm({
                  ...form,
                  discount_pct:
                    pct,
                  price_inr:
                    recalcPrice(
                      form.mrp_inr,
                      pct
                    ),
                });
              }}
            />
          </div>

          {/* SELLING PRICE */}
          <div>
            <Label>
              Selling Price (₹) *
            </Label>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={
                form.price_inr
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  price_inr:
                    +e.target.value,
                })
              }
              required
            />
          </div>

          {/* STOCK */}
          <div>
            <Label>
              Stock
            </Label>

            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock:
                    +e.target.value,
                })
              }
            />
          </div>

          {/* CATEGORY */}
          <div>
            <Label>
              Category
            </Label>

            <select
              className="w-full border rounded-md h-10 px-3 bg-background"
              value={
                form.category_id
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  category_id:
                    e.target.value,
                })
              }
            >
              <option value="">
                — None —
              </option>

              {cats.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              BRAND
          ================================================== */}

          <div>
            <Label>
              Brand{" "}
              <span className="text-destructive">
                *
              </span>
            </Label>

            <div className="border rounded-md bg-background p-2 max-h-40 overflow-y-auto">

              {brands.length ===
              0 ? (
                <p className="text-sm text-muted-foreground p-1">
                  No brands available
                </p>
              ) : (
                <div className="space-y-1">

                  {brands.map((b) => {
                    const selected =
                      form.brand_list.includes(
                        b.id
                      );

                    return (
                      <label
                        key={b.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-secondary text-sm"
                      >

                        <input
                          type="checkbox"
                          checked={
                            selected
                          }
                          onChange={() =>
                            toggleBrand(
                              b.id
                            )
                          }
                        />

                        <span>
                          {b.name}
                        </span>

                      </label>
                    );
                  })}

                </div>
              )}

            </div>

            {form.brand_list.length >
              0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {
                  form.brand_list
                    .length
                }{" "}
                brand
                {form.brand_list
                  .length !== 1
                  ? "s"
                  : ""}{" "}
                selected
              </p>
            )}

          </div>

          {/* =================================================
              COMPATIBLE VEHICLE MODELS
          ================================================== */}

          <div>
            <Label>
              Compatible Models{" "}
              <span className="text-destructive">
                *
              </span>
            </Label>

            <div className="border rounded-md bg-background p-2 max-h-40 overflow-y-auto">

              {form.brand_list.length ===
              0 ? (
                <p className="text-sm text-muted-foreground p-1">
                  Select a brand first
                </p>
              ) : compatibleModels.length ===
                0 ? (
                <p className="text-sm text-muted-foreground p-1">
                  No vehicle models available for selected brands
                </p>
              ) : (
                <div className="space-y-1">

                  {compatibleModels.map(
                    (model) => {
                      const selected =
                        form.compatible_model_ids.includes(
                          model.id
                        );

                      return (
                        <label
                          key={model.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-secondary text-sm"
                        >

                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleCompatibleModel(
                                model.id
                              )
                            }
                          />

                          <span>
                            {model.name}
                          </span>

                        </label>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {form.compatible_model_ids
              .length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {
                  form
                    .compatible_model_ids
                    .length
                }{" "}
                model
                {form
                  .compatible_model_ids
                  .length !== 1
                  ? "s"
                  : ""}{" "}
                selected
              </p>
            )}

          </div>

          {/* PRODUCT IMAGE */}
          <div className="md:col-span-2">

            <Label>
              Product Image
            </Label>

            <div className="flex items-center gap-3">

              <label className="inline-flex items-center gap-2 px-3 h-10 border rounded-md cursor-pointer hover:bg-secondary">

                <Upload size={16} />

                Upload

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFormImage(
                      e.target.files?.[0]
                    )
                  }
                />

              </label>

              <span className="text-xs text-muted-foreground">
                or paste URL below (max 1.5 MB if uploading)
              </span>

            </div>

            <Input
              className="mt-2"
              value={
                form.image_url
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  image_url:
                    e.target.value,
                })
              }
              placeholder="https://..."
            />

            {form.image_url && (
              <img
                src={
                  form.image_url
                }
                alt="preview"
                className="mt-2 h-24 w-24 object-cover rounded border"
              />
            )}

          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">

            <Label>
              Description
            </Label>

            <Textarea
              rows={3}
              value={
                form.description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />

          </div>

          {/* ACTIVE */}
          <label className="flex items-center gap-2 text-sm">

            <input
              type="checkbox"
              checked={
                form.is_active
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  is_active:
                    e.target.checked,
                })
              }
            />

            Active (visible in shop)

          </label>

          {/* FEATURED */}
          <label className="flex items-center gap-2 text-sm">

            <input
              type="checkbox"
              checked={
                form.is_featured
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  is_featured:
                    e.target.checked,
                })
              }
            />

            Featured / Best Seller (show on homepage)

          </label>

        </div>

        <Button type="submit">
          Add Product
        </Button>

      </form>

      {/* =====================================================
          INVENTORY TABLE
      ====================================================== */}

      <div className="space-y-3">

        <div className="flex items-center justify-between gap-4">

          <h3 className="font-display text-lg font-semibold uppercase">
            Inventory (
            {filtered.length}
            )
          </h3>

          <Input
            placeholder="Search by name or SKU"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="max-w-xs"
          />

        </div>

        {loading && (
          <p className="text-sm text-muted-foreground">
            Loading…
          </p>
        )}

        <div className="overflow-x-auto border rounded-lg">

          <table className="w-full text-sm">

            <thead className="bg-secondary text-left">

              <tr>

                <th className="p-3">
                  Image
                </th>

                <th className="p-3">
                  SKU
                </th>

                <th className="p-3 min-w-[200px]">
                  Name
                </th>

                <th className="p-3 min-w-[190px]">
                  Manufacturer
                </th>

                {/* NEW */}
                <th className="p-3 min-w-[220px]">
                  Brand
                </th>

                {/* NEW */}
                <th className="p-3 min-w-[260px]">
                  Compatible Models
                </th>

                <th className="p-3">
                  MRP
                </th>

                <th className="p-3">
                  Disc%
                </th>

                <th className="p-3">
                  Price
                </th>

                <th className="p-3">
                  Stock
                </th>

                <th className="p-3">
                  Active
                </th>

                <th className="p-3">
                  Featured
                </th>

                <th className="p-3 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((p) => {

                const dirty =
                  !!edits[p.id];

                const v = {
                  ...p,
                  ...edits[p.id],
                };

                const rowBrandIds =
                  (v.brand_list ||
                    []) as string[];

                const rowModelIds =
                  (v.compatible_model_ids ||
                    []) as string[];

                // Models belonging to
                // currently selected brands
                const rowAvailableModels =
                  getModelsForBrands(
                    rowBrandIds
                  );

                return (
                  <tr
                    key={p.id}
                    className="border-t align-top"
                  >

                    {/* =================================================
                        IMAGE
                    ================================================== */}

                    <td className="p-3">

                      <div className="flex items-center gap-2">

                        {v.image_url ? (
                          <img
                            src={
                              v.image_url
                            }
                            alt=""
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded" />
                        )}

                        <label className="inline-flex items-center gap-1 px-2 h-8 border rounded cursor-pointer text-xs hover:bg-secondary">

                          <Upload size={12} />

                          Upload

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleRowImage(
                                p.id,
                                e.target.files?.[0]
                              )
                            }
                          />

                        </label>

                      </div>

                    </td>

                    {/* =================================================
                        SKU
                    ================================================== */}

                    <td className="p-3 font-mono text-xs">
                      {p.sku}
                    </td>

                    {/* =================================================
                        NAME
                    ================================================== */}

                    <td className="p-3">

                      <Input
                        value={
                          v.name
                        }
                        onChange={(e) =>
                          updateField(
                            p.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="h-8"
                      />

                    </td>

                    {/* =================================================
                        MANUFACTURER
                    ================================================== */}

                    <td className="p-3">

                      <Input
                        value={
                          v.manufacturer ??
                          ""
                        }
                        onChange={(e) =>
                          updateField(
                            p.id,
                            "manufacturer",
                            e.target.value
                          )
                        }
                        className="h-8 min-w-[150px]"
                      />

                    </td>

                    {/* =================================================
                        BRAND
                    ================================================== */}

                    <td className="p-3">

                      <div className="border rounded-md bg-background p-2 max-h-32 overflow-y-auto min-w-[200px]">

                        {brands.length ===
                        0 ? (
                          <p className="text-xs text-muted-foreground">
                            No brands
                          </p>
                        ) : (
                          <div className="space-y-1">

                            {brands.map(
                              (brand) => {

                                const selected =
                                  rowBrandIds.includes(
                                    brand.id
                                  );

                                return (
                                  <label
                                    key={
                                      brand.id
                                    }
                                    className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-secondary text-xs"
                                  >

                                    <input
                                      type="checkbox"
                                      checked={
                                        selected
                                      }
                                      onChange={() =>
                                        toggleRowBrand(
                                          p.id,
                                          rowBrandIds,
                                          brand.id
                                        )
                                      }
                                    />

                                    <span>
                                      {
                                        brand.name
                                      }
                                    </span>

                                  </label>
                                );
                              }
                            )}

                          </div>
                        )}

                      </div>

                      <p className="text-[11px] text-muted-foreground mt-1">
                        {
                          rowBrandIds.length
                        }{" "}
                        selected
                      </p>

                    </td>

                    {/* =================================================
                        COMPATIBLE MODELS
                    ================================================== */}

                    <td className="p-3">

                      <div className="border rounded-md bg-background p-2 max-h-32 overflow-y-auto min-w-[240px]">

                        {rowBrandIds.length ===
                        0 ? (
                          <p className="text-xs text-muted-foreground">
                            Select brand first
                          </p>
                        ) : rowAvailableModels.length ===
                          0 ? (
                          <p className="text-xs text-muted-foreground">
                            No models for selected brands
                          </p>
                        ) : (
                          <div className="space-y-1">

                            {rowAvailableModels.map(
                              (model) => {

                                const selected =
                                  rowModelIds.includes(
                                    model.id
                                  );

                                return (
                                  <label
                                    key={
                                      model.id
                                    }
                                    className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-secondary text-xs"
                                  >

                                    <input
                                      type="checkbox"
                                      checked={
                                        selected
                                      }
                                      onChange={() =>
                                        toggleRowModel(
                                          p.id,
                                          model.id
                                        )
                                      }
                                    />

                                    <span>
                                      {
                                        model.name
                                      }
                                    </span>

                                  </label>
                                );
                              }
                            )}

                          </div>
                        )}

                      </div>

                      {/* SELECTED MODEL NAMES */}
                      {rowModelIds.length >
                        0 && (
                        <div className="mt-1">

                          <p className="text-[11px] text-muted-foreground">
                            {
                              rowModelIds.length
                            }{" "}
                            selected
                          </p>

                          <p className="text-[11px] leading-4">
                            {rowModelIds
                              .map(
                                (
                                  modelId
                                ) =>
                                  getModelName(
                                    modelId
                                  )
                              )
                              .join(
                                ", "
                              )}
                          </p>

                        </div>
                      )}

                    </td>

                    {/* =================================================
                        MRP
                    ================================================== */}

                    <td className="p-3">

                      <Input
                        type="number"
                        step="0.01"
                        value={
                          v.mrp_inr ??
                          ""
                        }
                        onChange={(e) =>
                          updateField(
                            p.id,
                            "mrp_inr",
                            e.target
                              .value ===
                              ""
                              ? null
                              : +e.target
                                  .value
                          )
                        }
                        className="h-8 w-24"
                      />

                    </td>

                    {/* =================================================
                        DISCOUNT
                    ================================================== */}

                    <td className="p-3">

                      <Input
                        type="number"
                        step="0.1"
                        value={
                          v.discount_pct ??
                          0
                        }
                        onChange={(e) =>
                          updateField(
                            p.id,
                            "discount_pct",
                            +e.target
                              .value
                          )
                        }
                        className="h-8 w-20"
                      />

                    </td>

                    {/* =================================================
                        PRICE
                    ================================================== */}

                    <td className="p-3">

                      <Input
                        type="number"
                        step="0.01"
                        value={
                          v.price_inr
                        }
                        onChange={(e) =>
                          updateField(
                            p.id,
                            "price_inr",
                            +e.target
                              .value
                          )
                        }
                        className="h-8 w-24"
                      />

                    </td>

                    {/* =================================================
                        STOCK
                    ================================================== */}

                    <td className="p-3">

                      <Input
                        type="number"
                        value={
                          v.stock
                        }
                        onChange={(e) =>
                          updateField(
                            p.id,
                            "stock",
                            +e.target
                              .value
                          )
                        }
                        className="h-8 w-20"
                      />

                    </td>

                    {/* =================================================
                        ACTIVE
                    ================================================== */}

                    <td className="p-3">

                      <input
                        type="checkbox"
                        checked={
                          !!v.is_active
                        }
                        onChange={(e) =>
                          updateField(
                            p.id,
                            "is_active",
                            e.target.checked
                          )
                        }
                      />

                    </td>

                    {/* =================================================
                        FEATURED
                    ================================================== */}

                    <td className="p-3">

                      <input
                        type="checkbox"
                        checked={
                          !!v.is_featured
                        }
                        onChange={(e) =>
                          updateField(
                            p.id,
                            "is_featured",
                            e.target.checked
                          )
                        }
                      />

                    </td>

                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    <td className="p-3 text-right whitespace-nowrap">

                      {dirty && (
                        <Button
                          size="sm"
                          onClick={() =>
                            saveRow(
                              p.id
                            )
                          }
                        >
                          <Save size={14} />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          deleteRow(
                            p.id
                          )
                        }
                      >
                        <Trash2 size={14} />
                      </Button>

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