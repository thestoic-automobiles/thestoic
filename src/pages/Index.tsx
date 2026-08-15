import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveCategoryImage } from "@/lib/imageUtils";

import PartSearch from "@/components/PartSearch";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

import {
  Cog,
  Disc,
  Filter,
  Lightbulb,
  Zap,
  Droplet,
  Car,
  MoveVertical,
  ChevronRight,
  ShieldCheck,
  Truck,
  Headphones,
  BadgeCheck,
  Star,
  Quote,
  Wrench,
  PackageCheck,
} from "lucide-react";

import hero from "@/assets/hero-garage.jpg";
import partsGrid from "@/assets/parts-grid.jpg";


// ============================================================
// TYPES
// ============================================================

type Brand = {
  id: string;
  name: string;
  logo_url: string | null;
  slug: string;
};

type Cat = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
};


// Actual products table structure
type ProductRow = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price_inr: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  brand_list: string[];
  mfg_year: number | null;
  compatible_model_ids: string[];
  is_active: boolean;
  created_at: string;
  mrp_inr: number | null;
  discount_pct: number | null;
  is_featured: boolean;
  manufacturer: string | null;
};


// ============================================================
// ICONS
// ============================================================

const ICONS: Record<string, any> = {
  Cog,
  Disc,
  Filter,
  Lightbulb,
  Zap,
  Droplet,
  Car,
  MoveVertical,
};


// ============================================================
// BRAND CARD
// ============================================================

const BrandCard = ({ brand }: { brand: Brand }) => {
  const [error, setError] = useState(
    !brand.logo_url ||
      brand.logo_url.startsWith("__l5e") ||
      brand.logo_url.includes("placeholder-brand")
  );

  return (
    <Link
      to={`/vehicle?brand=${brand.id}`}
      className="group flex flex-col items-center justify-center gap-2 h-32 w-40 shrink-0 bg-card border border-border rounded-lg px-4 shadow-sm hover:shadow-lg hover:border-signal/40 hover:-translate-y-1 transition-all duration-300"
    >
      {!error && brand.logo_url ? (
        <img
          src={brand.logo_url}
          alt={brand.name}
          onError={() => setError(true)}
          loading="lazy"
          className="h-14 w-auto max-w-[120px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
        />
      ) : (
        <div className="h-12 w-12 rounded-full bg-charcoal text-signal border border-signal/30 flex items-center justify-center font-display font-bold text-lg group-hover:bg-signal group-hover:text-white transition-colors shadow-inner">
          {brand.name.slice(0, 2).toUpperCase()}
        </div>
      )}

      <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-charcoal font-semibold transition-colors text-center truncate max-w-full">
        {brand.name}
      </span>
    </Link>
  );
};


// ============================================================
// FETCH FEATURED PRODUCTS
// ============================================================
//
// IMPORTANT:
//
// products.brand_list is UUID[]
// It is NOT a normal FK to brands.
//
// Therefore:
//
// products
//    |
//    | brand_list = [uuid1, uuid2, ...]
//    v
// brands
//
// We fetch products first, then fetch the corresponding brands.
// ============================================================

const fetchFeaturedProducts = async (): Promise<ProductCardData[]> => {
  // ----------------------------------------------------------
  // 1. Fetch featured products
  // ----------------------------------------------------------

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(`
      id,
      sku,
      name,
      description,
      price_inr,
      stock,
      image_url,
      category_id,
      brand_list,
      mfg_year,
      compatible_model_ids,
      is_active,
      created_at,
      mrp_inr,
      discount_pct,
      is_featured,
      manufacturer
    `)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (productError) {
    console.error(
      "[Supabase Error - Featured Products]:",
      productError
    );

    throw productError;
  }

  let products = (productData || []) as ProductRow[];

  // ----------------------------------------------------------
  // 2. If there are no featured products, get latest products
  // ----------------------------------------------------------

  if (products.length === 0) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("products")
      .select(`
        id,
        sku,
        name,
        description,
        price_inr,
        stock,
        image_url,
        category_id,
        brand_list,
        mfg_year,
        compatible_model_ids,
        is_active,
        created_at,
        mrp_inr,
        discount_pct,
        is_featured,
        manufacturer
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (fallbackError) {
      console.error(
        "[Supabase Error - Products Fallback]:",
        fallbackError
      );

      throw fallbackError;
    }

    products = (fallbackData || []) as ProductRow[];

    console.log(
      "⚡ [Supabase - Products Fallback Fetched]:",
      products
    );
  }

  if (products.length === 0) {
    return [];
  }

  // ----------------------------------------------------------
  // 3. Collect all brand IDs from brand_list[]
  // ----------------------------------------------------------

  const brandIds = Array.from(
    new Set(
      products.flatMap((product) =>
        Array.isArray(product.brand_list)
          ? product.brand_list
          : []
      )
    )
  ).filter(Boolean);

  // ----------------------------------------------------------
  // 4. Fetch brands separately
  // ----------------------------------------------------------

  let brandMap: Record<
    string,
    {
      id: string;
      name: string;
      logo_url: string | null;
      slug: string;
    }
  > = {};

  if (brandIds.length > 0) {
    const { data: brandData, error: brandError } = await supabase
      .from("brands")
      .select("id,name,slug,logo_url")
      .in("id", brandIds);

    if (brandError) {
      console.error(
        "[Supabase Error - Product Brands]:",
        brandError
      );

      // Do not fail the entire product list just because brand
      // lookup failed.
      brandMap = {};
    } else {
      brandMap = Object.fromEntries(
        (brandData || []).map((brand) => [
          brand.id,
          brand,
        ])
      );
    }
  }

  // ----------------------------------------------------------
  // 5. Convert products to ProductCardData
  // ----------------------------------------------------------

  const mappedProducts = products.map((product) => {
    const productBrandIds = Array.isArray(product.brand_list)
      ? product.brand_list
      : [];

    const productBrands = productBrandIds
      .map((brandId) => brandMap[brandId])
      .filter(Boolean);

    // ProductCard historically expects:
    //
    // brand: {
    //   name: string
    // }
    //
    // We provide the first brand for compatibility.
    //
    // If there are multiple brands, the first valid brand is
    // displayed by ProductCard.

    const primaryBrand = productBrands[0];

    return {
      ...product,

      brand: primaryBrand
        ? {
            name: primaryBrand.name,
          }
        : undefined,
    } as unknown as ProductCardData;
  });

  console.log(
    "⚡ [Supabase - Featured Products Mapped]:",
    mappedProducts
  );

  return mappedProducts;
};


// ============================================================
// HOME PAGE
// ============================================================

const Index = () => {
  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const {
    data: cats = [],
    isLoading: catsLoading,
  } = useQuery<Cat[]>({
    queryKey: ["part_categories"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("part_categories")
        .select("id,name,slug,icon,image_url")
        .order("name");

      if (error) {
        console.error(
          "[Supabase Error - Categories]:",
          error
        );

        throw error;
      }

      console.log(
        "📦 [Supabase - Categories Fetched] Count:",
        data?.length,
        data
      );

      if (data && data.length > 0) {
        console.table(data);
      }

      return (data || []) as Cat[];
    },

    staleTime: 1000 * 60 * 10,
  });


  // ==========================================================
  // BRANDS
  // ==========================================================

  const {
    data: brands = [],
    isLoading: brandsLoading,
  } = useQuery<Brand[]>({
    queryKey: ["brands"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id,name,slug,logo_url")
        .order("name");

      if (error) {
        console.error(
          "[Supabase Error - Brands]:",
          error
        );

        throw error;
      }

      console.log(data);

      console.log(
        "🏷️ [Supabase - Brands Fetched] Count:",
        data?.length,
        data
      );

      if (data && data.length > 0) {
        console.table(data);
      }

      return (data || []) as Brand[];
    },

    staleTime: 1000 * 60 * 10,
  });


  // ==========================================================
  // FEATURED PRODUCTS
  // ==========================================================

  const {
    data: featured = [],
    isLoading: featuredLoading,
  } = useQuery<ProductCardData[]>({
    queryKey: ["featured_products"],

    queryFn: fetchFeaturedProducts,

    staleTime: 1000 * 60 * 5,
  });


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Layout>

      {/* ======================================================
          SEO
      ====================================================== */}

      <SEO
        title="The Stoic Automobiles — Genuine Auto Spare Parts Online in India"
        description="Buy 100% genuine OEM car & bike spare parts online. Search by brand, vehicle or part. B2B dealer pricing, GST invoicing, fast pan-India dispatch."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item:
                "https://hostinger-project-4f7-4b3a6c7-4c02netlify-app.lovable.app/",
            },
          ],
        }}
      />


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative pt-24 lg:pt-28">

        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Auto workshop"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep via-charcoal-deep/85 to-charcoal-deep/40" />
        </div>

        <div className="relative container mx-auto py-20 md:py-28">

          <div className="max-w-3xl text-primary-foreground">

            <div className="inline-flex items-center gap-2 bg-signal/15 border border-signal/40 text-signal text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-sm mb-5">

              <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />

              Genuine Spares • India

            </div>


            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-[1.05] mb-5">

              The Right Part.
              <br />

              <span className="text-signal">
                Every Time.
              </span>

            </h1>


            <p className="text-base md:text-lg text-primary-foreground/80 max-w-xl mb-8">
              Find the exact spare for your car or bike — search by brand,
              vehicle or part. Trusted by retail customers and B2B dealers
              pan-India.
            </p>


            <div className="flex flex-wrap gap-3">

              <Button
                asChild
                size="lg"
                className="bg-signal hover:bg-signal-deep text-white"
              >
                <Link to="/shop">
                  Browse Catalog
                </Link>
              </Button>


              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/auth?mode=b2b">
                  B2B Dealer Login
                </Link>
              </Button>

            </div>

          </div>


          <div className="mt-12 md:-mb-24">
            <PartSearch />
          </div>

        </div>

      </section>


      <div className="h-12 md:h-28" />


      {/* ======================================================
          BRANDS MARQUEE
      ====================================================== */}

      <section className="py-16 bg-gradient-to-b from-background to-muted/30 border-y border-border overflow-hidden">

        <div className="container mx-auto">

          <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Trusted Brands We Stock
          </p>

          <h3 className="text-center font-display text-2xl md:text-3xl uppercase font-bold tracking-tight mb-10">
            Genuine Spares for Every Leading Marque
          </h3>


          <div className="relative">

            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />


            {brandsLoading ? (

              <div className="flex gap-4 justify-center overflow-hidden">

                {Array.from({ length: 6 }).map((_, i) => (

                  <div
                    key={i}
                    className="h-32 w-40 shrink-0 bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-3"
                  >

                    <Skeleton className="h-12 w-24 rounded" />

                    <Skeleton className="h-3 w-16 rounded" />

                  </div>

                ))}

              </div>

            ) : (

              <div className="flex gap-4 animate-[marquee_40s_linear_infinite] w-max">

                {[...brands, ...brands].map((brand, i) => (

                  <BrandCard
                    key={`${brand.id}-${i}`}
                    brand={brand}
                  />

                ))}

              </div>

            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <section className="py-20 bg-gradient-to-b from-background to-secondary/40">

        <div className="container mx-auto">

          <SectionHeading
            eyebrow="Shop by category"
            title="Browse Parts"
            subtitle="From engine internals to lighting — over 20+ part categories covered."
          />


          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

            {catsLoading ? (

              Array.from({ length: 8 }).map((_, i) => (

                <div
                  key={i}
                  className="rounded-lg aspect-[4/5] bg-muted/70 border border-border relative overflow-hidden flex flex-col justify-between p-5"
                >

                  <Skeleton className="h-10 w-10 rounded-sm bg-muted-foreground/10" />

                  <div className="space-y-2">

                    <Skeleton className="h-3 w-16 bg-muted-foreground/10" />

                    <Skeleton className="h-6 w-3/4 bg-muted-foreground/10" />

                    <Skeleton className="h-3 w-20 bg-muted-foreground/10" />

                  </div>

                </div>

              ))

            ) : (

              cats.map((c) => {

                const Icon =
                  ICONS[c.icon || "Cog"] || Cog;

                const img = resolveCategoryImage(
                  c.image_url,
                  c.slug,
                  c.name
                );


                return (

                  <Link
                    key={c.id}
                    to={`/shop?category=${c.id}`}
                    className="group relative overflow-hidden rounded-lg aspect-[4/5] bg-charcoal-deep ring-1 ring-border/60 shadow-md hover:shadow-2xl transition-all duration-500"
                  >

                    <img
                      src={img}
                      alt={c.name}
                      onError={(e) => {
                        (
                          e.currentTarget as HTMLImageElement
                        ).src = resolveCategoryImage(
                          null,
                          c.slug,
                          c.name
                        );
                      }}
                      loading="lazy"
                      width={100}
                      height={100}
                      className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                    />


                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-charcoal-deep/60 to-transparent" />


                    <div className="absolute top-4 left-4 h-10 w-10 rounded-sm bg-signal/90 text-charcoal-deep flex items-center justify-center shadow-lg backdrop-blur-sm">

                      <Icon
                        size={18}
                        strokeWidth={2.4}
                      />

                    </div>


                    <div className="absolute bottom-0 left-0 right-0 p-5">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-signal/90 mb-1">
                        Category
                      </p>

                      <h3 className="font-display text-lg md:text-xl font-bold uppercase tracking-tight text-primary-foreground leading-tight">
                        {c.name}
                      </h3>


                      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground/80 group-hover:text-signal transition-colors">

                        Explore

                        <ChevronRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />

                      </div>

                    </div>


                    <div className="absolute inset-0 ring-1 ring-inset ring-signal/0 group-hover:ring-signal/40 transition-all duration-500 rounded-lg" />

                  </Link>

                );

              })

            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          FEATURED PRODUCTS
      ====================================================== */}

      <section className="py-20 bg-secondary">

        <div className="container mx-auto">

          <SectionHeading
            eyebrow="Best sellers"
            title="Featured Parts"
          />


          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

            {featuredLoading ? (

              Array.from({ length: 8 }).map((_, i) => (

                <div
                  key={i}
                  className="bg-card border border-border rounded-md p-4 flex flex-col justify-between h-[340px]"
                >

                  <Skeleton className="w-full aspect-square rounded-sm mb-3" />

                  <div className="space-y-2">

                    <Skeleton className="h-3 w-1/3" />

                    <Skeleton className="h-4 w-4/5" />

                    <Skeleton className="h-5 w-1/2 mt-2" />

                  </div>

                  <Skeleton className="h-9 w-full mt-3 rounded" />

                </div>

              ))

            ) : (

              featured.map((p) => (

                <ProductCard
                  key={p.id}
                  p={p}
                />

              ))

            )}

          </div>


          <div className="text-center mt-10">

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-charcoal text-charcoal hover:bg-charcoal hover:text-primary-foreground"
            >

              <Link to="/shop">

                View All Parts

                <ChevronRight size={16} />

              </Link>

            </Button>

          </div>

        </div>

      </section>


      {/* ======================================================
          STATS BAND
      ====================================================== */}

      <section className="bg-charcoal-deep text-primary-foreground py-14">

        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

          {[
            {
              n: "15+",
              l: "Years in business",
            },
            {
              n: "10,000+",
              l: "Parts catalogued",
            },
            {
              n: "500+",
              l: "B2B dealers served",
            },
            {
              n: "24h",
              l: "Avg. dispatch time",
            },
          ].map((s) => (

            <div key={s.l}>

              <p className="font-display text-4xl md:text-5xl font-bold text-signal">
                {s.n}
              </p>

              <p className="text-xs md:text-sm uppercase tracking-widest text-primary-foreground/70 mt-2">
                {s.l}
              </p>

            </div>

          ))}

        </div>

      </section>


      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="py-20">

        <div className="container mx-auto">

          <SectionHeading
            eyebrow="Simple process"
            title="How It Works"
            subtitle="From search to your doorstep in 4 quick steps."
          />


          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {[
              {
                Icon: Filter,
                t: "Search Part",
                d: "Use brand, vehicle or part filters to pinpoint the right SKU.",
              },
              {
                Icon: PackageCheck,
                t: "Verify Fit",
                d: "Check compatibility, OEM number and warranty info.",
              },
              {
                Icon: Wrench,
                t: "Order & Pay",
                d: "Add to cart, B2C or B2B pricing — secure checkout.",
              },
              {
                Icon: Truck,
                t: "Fast Delivery",
                d: "Dispatch within 24 hrs pan-India.",
              },
            ].map(({ Icon, t, d }, i) => (

              <div
                key={t}
                className="relative bg-card border border-border rounded-md p-6 hover-lift"
              >

                <span className="absolute -top-3 -left-3 h-8 w-8 bg-signal text-white text-sm font-bold font-display rounded-sm flex items-center justify-center shadow-md">
                  {i + 1}
                </span>


                <div className="h-12 w-12 bg-charcoal text-signal rounded-sm flex items-center justify-center mb-4">

                  <Icon size={22} />

                </div>


                <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-1.5">
                  {t}
                </h3>


                <p className="text-sm text-muted-foreground">
                  {d}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          TESTIMONIALS
      ====================================================== */}

      <section className="py-20 bg-secondary">

        <div className="container mx-auto">

          <SectionHeading
            eyebrow="What customers say"
            title="Trusted Across India"
          />


          <div className="grid md:grid-cols-3 gap-6">

            {[
              {
                n: "Rohit P.",
                r: "Workshop Owner",
                q: "Genuine parts, dealer pricing and quick dispatch. Easily our most reliable spares source.",
              },
              {
                n: "Sneha K.",
                r: "Vehicle Owner",
                q: "Found the exact filter for my old Swift in two clicks. Saved me a trip to the city.",
              },
              {
                n: "Imran S.",
                r: "Fleet Manager",
                q: "B2B login with customer code is a game-changer. Orders go out same-day.",
              },
            ].map((t) => (

              <div
                key={t.n}
                className="bg-card border border-border rounded-md p-6"
              >

                <Quote
                  className="text-signal mb-3"
                  size={26}
                />


                <p className="text-sm text-charcoal leading-relaxed mb-4">
                  "{t.q}"
                </p>


                <div className="flex items-center gap-1 text-signal mb-2">

                  {Array.from({ length: 5 }).map((_, i) => (

                    <Star
                      key={i}
                      size={14}
                      fill="currentColor"
                      strokeWidth={0}
                    />

                  ))}

                </div>


                <p className="font-display font-semibold text-sm">
                  {t.n}
                </p>

                <p className="text-xs text-muted-foreground">
                  {t.r}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          TRUST ASSURANCES
      ====================================================== */}

      <section className="py-20 bg-background">

        <div className="container mx-auto">

          <SectionHeading
            eyebrow="Why shop with us"
            title="Built on Trust"
            subtitle="Every order is backed by genuine sourcing, transparent pricing and real after-sales support."
          />


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {[
              {
                Icon: BadgeCheck,
                t: "Authorised Dealer Network",
                d: "Sourced directly from authorised distributors of Maruti, Hyundai, Tata, Mahindra, Bajaj, Honda and more.",
              },
              {
                Icon: ShieldCheck,
                t: "100% Genuine OEM Parts",
                d: "Every part carries the original brand barcode and warranty. No counterfeits, no compromises.",
              },
              {
                Icon: PackageCheck,
                t: "7-Day Easy Returns",
                d: "Wrong fitment or damaged part? Return within 7 days for a full replacement or refund.",
              },
              {
                Icon: Truck,
                t: "Insured Pan-India Shipping",
                d: "Bubble-wrapped and tracked. We replace anything damaged in transit at our cost.",
              },
              {
                Icon: Wrench,
                t: "GST-Compliant Invoicing",
                d: "Proper tax invoice on every order — claim input credit for your workshop or business.",
              },
              {
                Icon: Headphones,
                t: "Real Humans on WhatsApp",
                d: "Our spares team replies in minutes, every day from 8 AM to 8 PM. No bots.",
              },
            ].map(({ Icon, t, d }) => (

              <div
                key={t}
                className="group bg-card border border-border rounded-md p-6 hover:border-signal/60 hover:shadow-md transition-all"
              >

                <div className="h-11 w-11 bg-signal/10 text-signal flex items-center justify-center rounded-sm mb-4 group-hover:bg-signal group-hover:text-white transition-colors">

                  <Icon
                    size={22}
                    strokeWidth={2.2}
                  />

                </div>


                <h3 className="font-display text-base font-bold uppercase tracking-tight mb-2">
                  {t}
                </h3>


                <p className="text-sm text-muted-foreground leading-relaxed">
                  {d}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          FAQ
      ====================================================== */}

      <section className="py-20 bg-background">

        <div className="container mx-auto max-w-3xl">

          <SectionHeading
            eyebrow="Common questions"
            title="Buying With Confidence"
          />


          <div className="space-y-3">

            {[
              {
                q: "Are these parts 100% genuine?",
                a: "Yes. We source directly from authorised distributors. Every part ships with the original brand packaging, OEM number and applicable manufacturer warranty.",
              },
              {
                q: "What if the part doesn't fit my vehicle?",
                a: "Send us a photo on WhatsApp within 7 days of delivery. We'll arrange a replacement or full refund — no restocking fees.",
              },
              {
                q: "Do you provide GST invoices?",
                a: "Every order includes a GST-compliant tax invoice. B2B dealers can register a customer code to access wholesale pricing and credit terms.",
              },
              {
                q: "How fast will I receive my order?",
                a: "We dispatch within 24 hours pan-India. Most metro deliveries arrive in 2–3 business days; remote pincodes may take 4–5 days.",
              },
              {
                q: "Is online payment safe on your site?",
                a: "Yes. We use industry-standard SSL encryption and PCI-DSS compliant payment gateways. We never store your card details on our servers.",
              },
            ].map((f) => (

              <details
                key={f.q}
                className="group bg-card border border-border rounded-md p-5 hover:border-signal/50 transition-colors"
              >

                <summary className="flex items-center justify-between cursor-pointer font-display font-semibold text-charcoal list-none">

                  <span>
                    {f.q}
                  </span>

                  <ChevronRight
                    size={18}
                    className="text-signal transition-transform group-open:rotate-90"
                  />

                </summary>


                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  {f.a}
                </p>

              </details>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          B2B CTA
      ====================================================== */}

      <section className="py-20">

        <div className="container mx-auto">

          <div className="grid lg:grid-cols-2 gap-10 items-center bg-charcoal-deep text-primary-foreground rounded-md overflow-hidden">

            <div className="p-10 md:p-14">

              <p className="text-signal font-semibold tracking-widest uppercase text-xs mb-3">
                For Dealers & Workshops
              </p>


              <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
                B2B Pricing
                <br />
                on Your Customer Code
              </h2>


              <p className="text-primary-foreground/75 mb-6 max-w-md">
                Register as a dealer to unlock wholesale pricing, dedicated stock allocation and credit terms. Login with your customer code.
              </p>


              <div className="flex flex-wrap gap-3">

                <Button
                  asChild
                  size="lg"
                  className="bg-signal hover:bg-signal-deep text-white"
                >

                  <Link to="/auth?mode=b2b">
                    Dealer Login
                  </Link>

                </Button>


                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >

                  <Link to="/contact">
                    Request Account
                  </Link>

                </Button>

              </div>

            </div>


            <div className="h-72 lg:h-full">

              <img
                src={partsGrid}
                alt="Premium auto parts"
                className="w-full h-full object-cover"
                loading="lazy"
                width={1600}
                height={1200}
              />

            </div>

          </div>

        </div>

      </section>

    </Layout>
  );
};


export default Index;