import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";

import PartSearch from "@/components/PartSearch";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Cog, Disc, Filter, Lightbulb, Zap, Droplet, Car, MoveVertical, ChevronRight, ShieldCheck, Truck, Headphones, BadgeCheck, Star, Quote, Wrench, PackageCheck } from "lucide-react";
import hero from "@/assets/hero-garage.jpg";
import partsGrid from "@/assets/parts-grid.jpg";
import catBody from "@/assets/categories/body-exterior.jpg";
import catBrakes from "@/assets/categories/brakes.jpg";
import catElec from "@/assets/categories/electricals.jpg";
import catEngine from "@/assets/categories/engine.jpg";
import catFilters from "@/assets/categories/filters.jpg";
import catLighting from "@/assets/categories/lighting.jpg";
import catLube from "@/assets/categories/lubricants.jpg";
import catSusp from "@/assets/categories/suspension.jpg";

const CAT_IMAGES: Record<string, string> = {
  "body-exterior": catBody,
  brakes: catBrakes,
  electricals: catElec,
  engine: catEngine,
  filters: catFilters,
  lighting: catLighting,
  lubricants: catLube,
  suspension: catSusp,
};

const ICONS: Record<string, any> = { Cog, Disc, Filter, Lightbulb, Zap, Droplet, Car, MoveVertical };

const BRAND_LOGOS = [
  { name: "Maruti Suzuki", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Suzuki_logo_2.svg/320px-Suzuki_logo_2.svg.png" },
  { name: "Hyundai", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/320px-Hyundai_Motor_Company_logo.svg.png" },
  { name: "Tata Motors", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/320px-Tata_logo.svg.png" },
  { name: "Mahindra", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Mahindra_%26_Mahindra_Logo.svg/320px-Mahindra_%26_Mahindra_Logo.svg.png" },
  { name: "Honda", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Honda_Logo.svg/320px-Honda_Logo.svg.png" },
  { name: "Toyota", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/320px-Toyota_carlogo.svg.png" },
  { name: "Kia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/KIA_logo3.svg/320px-KIA_logo3.svg.png" },
  { name: "Bajaj", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Bajaj_Auto.svg/320px-Bajaj_Auto.svg.png" },
  { name: "Hero", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Hero_MotoCorp_Logo.svg/320px-Hero_MotoCorp_Logo.svg.png" },
  { name: "TVS", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/TVS_Motor_Company_Logo.svg/320px-TVS_Motor_Company_Logo.svg.png" },
  { name: "Yamaha", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Yamaha_Motor_Logo_%28blue%29.svg/320px-Yamaha_Motor_Logo_%28blue%29.svg.png" },
  { name: "Royal Enfield", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Royal_Enfield_logo.svg/320px-Royal_Enfield_logo.svg.png" },
];

type Cat = { id: string; name: string; slug: string; icon: string | null; image_url: string | null };

const Index = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [featured, setFeatured] = useState<ProductCardData[]>([]);

  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from("part_categories").select("id,name,slug,icon,image_url").order("name"),
        supabase.from("products").select("id,sku,name,price_inr,stock,image_url,mfg_year,brand:brands(name)").eq("is_active", true).eq("is_featured", true).order("created_at", { ascending: false }).limit(8),
      ]);
      setCats((c.data as any) || []);
      let feat = (p.data as any) || [];
      if (feat.length === 0) {
        const fb = await supabase.from("products").select("id,sku,name,price_inr,stock,image_url,mfg_year,brand:brands(name)").eq("is_active", true).order("created_at", { ascending: false }).limit(8);
        feat = fb.data || [];
      }
      setFeatured(feat);
    })();
  }, []);

  return (
    <Layout>
      <SEO
        title="The Stoic Automobiles — Genuine Auto Spare Parts Online in India"
        description="Buy 100% genuine OEM car & bike spare parts online. Search by brand, vehicle or part. B2B dealer pricing, GST invoicing, fast pan-India dispatch."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://hostinger-project-4f7-4b3a6c7-4c02netlify-app.lovable.app/" },
          ],
        }}
      />
      {/* Hero */}

      <section className="relative pt-24 lg:pt-28">
        <div className="absolute inset-0">
          <img src={hero} alt="Auto workshop" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep via-charcoal-deep/85 to-charcoal-deep/40" />
        </div>
        <div className="relative container mx-auto py-20 md:py-28">
          <div className="max-w-3xl text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-signal/15 border border-signal/40 text-signal text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-sm mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" /> Genuine Spares • India
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-[1.05] mb-5">
              The Right Part.<br /><span className="text-signal">Every Time.</span>
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/80 max-w-xl mb-8">
              Find the exact spare for your car or bike — search by brand, vehicle or part. Trusted by retail customers and B2B dealers pan-India.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-signal hover:bg-signal-deep text-white"><Link to="/shop">Browse Catalog</Link></Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"><Link to="/auth?mode=b2b">B2B Dealer Login</Link></Button>
            </div>
          </div>

          <div className="mt-12 md:-mb-24">
            <PartSearch />
          </div>
        </div>
      </section>

      <div className="h-12 md:h-28" />

      {/* Trust strip */}
      <section className="bg-background border-y border-border">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            { Icon: BadgeCheck, t: "100% Genuine", s: "OE & branded spares" },
            { Icon: Truck, t: "Fast Dispatch", s: "Across India" },
            { Icon: ShieldCheck, t: "Warranty Backed", s: "Brand warranty applies" },
            { Icon: Headphones, t: "Expert Help", s: "Call 73874 80081" },
          ].map(({ Icon, t, s }) => (
            <div key={t} className="flex items-center gap-3 p-5">
              <div className="h-10 w-10 bg-signal/10 text-signal flex items-center justify-center rounded-sm"><Icon size={20} /></div>
              <div>
                <p className="font-semibold text-sm text-charcoal">{t}</p>
                <p className="text-xs text-muted-foreground">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/40">
        <div className="container mx-auto">
          <SectionHeading eyebrow="Shop by category" title="Browse Parts" subtitle="From engine internals to lighting — over 20+ part categories covered." />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {cats.map((c) => {
              const Icon = ICONS[c.icon || "Cog"] || Cog;
              const img = c.image_url || CAT_IMAGES[c.slug];
              return (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.id}`}
                  className="group relative overflow-hidden rounded-lg aspect-[4/5] bg-charcoal-deep ring-1 ring-border/60 shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  {img && (
                    <img
                      src={img}
                      alt={c.name}
                      loading="lazy"
                      width={800}
                      height={1000}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-charcoal-deep/60 to-transparent" />
                  <div className="absolute top-4 left-4 h-10 w-10 rounded-sm bg-signal/90 text-charcoal-deep flex items-center justify-center shadow-lg backdrop-blur-sm">
                    <Icon size={18} strokeWidth={2.4} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-signal/90 mb-1">Category</p>
                    <h3 className="font-display text-lg md:text-xl font-bold uppercase tracking-tight text-primary-foreground leading-tight">
                      {c.name}
                    </h3>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground/80 group-hover:text-signal transition-colors">
                      Explore <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <div className="absolute inset-0 ring-1 ring-inset ring-signal/0 group-hover:ring-signal/40 transition-all duration-500 rounded-lg" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto">
          <SectionHeading eyebrow="Best sellers" title="Featured Parts" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" variant="outline" className="border-charcoal text-charcoal hover:bg-charcoal hover:text-primary-foreground">
              <Link to="/shop">View All Parts <ChevronRight size={16} /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-charcoal-deep text-primary-foreground py-14">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "15+", l: "Years in business" },
            { n: "10,000+", l: "Parts catalogued" },
            { n: "500+", l: "B2B dealers served" },
            { n: "24h", l: "Avg. dispatch time" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-4xl md:text-5xl font-bold text-signal">{s.n}</p>
              <p className="text-xs md:text-sm uppercase tracking-widest text-primary-foreground/70 mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands marquee */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30 border-y border-border overflow-hidden">
        <div className="container mx-auto">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Trusted Brands We Stock</p>
          <h3 className="text-center font-display text-2xl md:text-3xl uppercase font-bold tracking-tight mb-10">Genuine Spares for Every Leading Marque</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex gap-4 animate-[marquee_40s_linear_infinite] w-max">
              {[...BRAND_LOGOS, ...BRAND_LOGOS].map((b, i) => (
                <div
                  key={`${b.name}-${i}`}
                  className="group flex flex-col items-center justify-center gap-2 h-32 w-40 shrink-0 bg-card border border-border rounded-lg px-4 shadow-sm hover:shadow-lg hover:border-signal/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <img
                    src={b.logo}
                    alt={`${b.name} logo`}
                    loading="lazy"
                    className="h-14 w-auto max-w-[120px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-charcoal font-semibold transition-colors">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto">
          <SectionHeading eyebrow="Simple process" title="How It Works" subtitle="From search to your doorstep in 4 quick steps." />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { Icon: Filter, t: "Search Part", d: "Use brand, vehicle or part filters to pinpoint the right SKU." },
              { Icon: PackageCheck, t: "Verify Fit", d: "Check compatibility, OEM number and warranty info." },
              { Icon: Wrench, t: "Order & Pay", d: "Add to cart, B2C or B2B pricing — secure checkout." },
              { Icon: Truck, t: "Fast Delivery", d: "Dispatch within 24 hrs pan-India." },
            ].map(({ Icon, t, d }, i) => (
              <div key={t} className="relative bg-card border border-border rounded-md p-6 hover-lift">
                <span className="absolute -top-3 -left-3 h-8 w-8 bg-signal text-white text-sm font-bold font-display rounded-sm flex items-center justify-center shadow-md">{i + 1}</span>
                <div className="h-12 w-12 bg-charcoal text-signal rounded-sm flex items-center justify-center mb-4"><Icon size={22} /></div>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-1.5">{t}</h3>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto">
          <SectionHeading eyebrow="What customers say" title="Trusted Across India" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "Rohit P.", r: "Workshop Owner", q: "Genuine parts, dealer pricing and quick dispatch. Easily our most reliable spares source." },
              { n: "Sneha K.", r: "Vehicle Owner", q: "Found the exact filter for my old Swift in two clicks. Saved me a trip to the city." },
              { n: "Imran S.", r: "Fleet Manager", q: "B2B login with customer code is a game-changer. Orders go out same-day." },
            ].map((t) => (
              <div key={t.n} className="bg-card border border-border rounded-md p-6">
                <Quote className="text-signal mb-3" size={26} />
                <p className="text-sm text-charcoal leading-relaxed mb-4">"{t.q}"</p>
                <div className="flex items-center gap-1 text-signal mb-2">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                </div>
                <p className="font-display font-semibold text-sm">{t.n}</p>
                <p className="text-xs text-muted-foreground">{t.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust assurances */}
      <section className="py-20 bg-background">
        <div className="container mx-auto">
          <SectionHeading eyebrow="Why shop with us" title="Built on Trust" subtitle="Every order is backed by genuine sourcing, transparent pricing and real after-sales support." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { Icon: BadgeCheck, t: "Authorised Dealer Network", d: "Sourced directly from authorised distributors of Maruti, Hyundai, Tata, Mahindra, Bajaj, Honda and more." },
              { Icon: ShieldCheck, t: "100% Genuine OEM Parts", d: "Every part carries the original brand barcode and warranty. No counterfeits, no compromises." },
              { Icon: PackageCheck, t: "7-Day Easy Returns", d: "Wrong fitment or damaged part? Return within 7 days for a full replacement or refund." },
              { Icon: Truck, t: "Insured Pan-India Shipping", d: "Bubble-wrapped and tracked. We replace anything damaged in transit at our cost." },
              { Icon: Wrench, t: "GST-Compliant Invoicing", d: "Proper tax invoice on every order — claim input credit for your workshop or business." },
              { Icon: Headphones, t: "Real Humans on WhatsApp", d: "Our spares team replies in minutes, every day from 8 AM to 8 PM. No bots." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="group bg-card border border-border rounded-md p-6 hover:border-signal/60 hover:shadow-md transition-all">
                <div className="h-11 w-11 bg-signal/10 text-signal flex items-center justify-center rounded-sm mb-4 group-hover:bg-signal group-hover:text-white transition-colors">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3 className="font-display text-base font-bold uppercase tracking-tight mb-2">{t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secure payments */}
      <section className="py-10 bg-charcoal-deep text-primary-foreground/80 border-y border-primary-foreground/5">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-signal shrink-0" size={28} />
            <div>
              <p className="font-display font-bold uppercase tracking-wide text-primary-foreground text-sm">100% Secure Checkout</p>
              <p className="text-xs text-primary-foreground/60">SSL encrypted • PCI-compliant payment gateways</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "EMI", "Cash on Delivery"].map((m) => (
              <span key={m} className="text-[11px] font-semibold uppercase tracking-wider bg-primary-foreground/10 border border-primary-foreground/15 text-primary-foreground/90 px-3 py-1.5 rounded-sm">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto max-w-3xl">
          <SectionHeading eyebrow="Common questions" title="Buying With Confidence" />
          <div className="space-y-3">
            {[
              { q: "Are these parts 100% genuine?", a: "Yes. We source directly from authorised distributors. Every part ships with the original brand packaging, OEM number and applicable manufacturer warranty." },
              { q: "What if the part doesn't fit my vehicle?", a: "Send us a photo on WhatsApp within 7 days of delivery. We'll arrange a replacement or full refund — no restocking fees." },
              { q: "Do you provide GST invoices?", a: "Every order includes a GST-compliant tax invoice. B2B dealers can register a customer code to access wholesale pricing and credit terms." },
              { q: "How fast will I receive my order?", a: "We dispatch within 24 hours pan-India. Most metro deliveries arrive in 2–3 business days; remote pincodes may take 4–5 days." },
              { q: "Is online payment safe on your site?", a: "Yes. We use industry-standard SSL encryption and PCI-DSS compliant payment gateways. We never store your card details on our servers." },
            ].map((f) => (
              <details key={f.q} className="group bg-card border border-border rounded-md p-5 hover:border-signal/50 transition-colors">
                <summary className="flex items-center justify-between cursor-pointer font-display font-semibold text-charcoal list-none">
                  <span>{f.q}</span>
                  <ChevronRight size={18} className="text-signal transition-transform group-open:rotate-90" />
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>





      {/* B2B CTA */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center bg-charcoal-deep text-primary-foreground rounded-md overflow-hidden">
            <div className="p-10 md:p-14">
              <p className="text-signal font-semibold tracking-widest uppercase text-xs mb-3">For Dealers & Workshops</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">B2B Pricing<br />on Your Customer Code</h2>
              <p className="text-primary-foreground/75 mb-6 max-w-md">Register as a dealer to unlock wholesale pricing, dedicated stock allocation and credit terms. Login with your customer code.</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-signal hover:bg-signal-deep text-white"><Link to="/auth?mode=b2b">Dealer Login</Link></Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"><Link to="/contact">Request Account</Link></Button>
              </div>
            </div>
            <div className="h-72 lg:h-full">
              <img src={partsGrid} alt="Premium auto parts" className="w-full h-full object-cover" loading="lazy" width={1600} height={1200} />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
