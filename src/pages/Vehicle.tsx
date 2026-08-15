import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import {
  Car,
  ChevronRight,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Brand {
  id: string;
  name: string;
  logo_url: string;
}

interface VehicleModel {
  id: string;
  name: string;
  brand_id: string;
  vehicle_type: string;
  years: number[];
  image_url: string | null;
}

/* -------------------------------------------------------
   Brand Card
------------------------------------------------------- */

const BrandCard = ({ brand }: { brand: Brand }) => {
  return (
    <Link
      to={`/vehicle?brand=${brand.id}`}
      className="group flex h-32 w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-signal/40 hover:shadow-lg"
    >
      {brand.logo_url ? (
        <img
          src={brand.logo_url}
          alt={brand.name}
          loading="lazy"
          className="h-14 w-auto max-w-[120px] object-contain grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-signal/30 bg-charcoal font-display text-lg font-bold text-signal shadow-inner transition-colors group-hover:bg-signal group-hover:text-white">
          {brand.name.slice(0, 2).toUpperCase()}
        </div>
      )}

      <span className="max-w-full truncate text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-charcoal">
        {brand.name}
      </span>
    </Link>
  );
};

/* -------------------------------------------------------
   Vehicle Skeleton
------------------------------------------------------- */

const VehicleSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div className="relative h-48 bg-muted/60">
        <Skeleton className="h-full w-full rounded-none" />

        <div className="absolute left-4 top-4">
          <Skeleton className="h-8 w-8 rounded-sm" />
        </div>
      </div>

      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Vehicle Card
------------------------------------------------------- */

const VehicleCard = ({ vehicle }: { vehicle: VehicleModel }) => {
  return (
    <div className="group relative overflow-hidden rounded-md border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-signal/50 hover:shadow-xl">

      {/* Vehicle visual area */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-charcoal-deep via-charcoal to-charcoal-deep">

        {/* Database vehicle image */}
        {vehicle.image_url ? (
          <img
            src={vehicle.image_url}
            alt={vehicle.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-sm border border-signal/30 bg-signal/10 text-signal shadow-lg">
            <Car size={40} strokeWidth={1.7} />
          </div>
        )}

        {/* Number badge */}
        <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-sm bg-signal font-display text-sm font-bold text-charcoal-deep shadow-md">
          <Car size={15} />
        </div>

        {/* Vehicle type */}
        <div className="absolute bottom-4 left-4">
          <span className="rounded-sm border border-signal/30 bg-charcoal-deep/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-signal backdrop-blur-sm">
            {vehicle.vehicle_type}
          </span>
        </div>

        {/* Hover border */}
        <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-signal/0 transition-all duration-500 group-hover:ring-signal/40" />
      </div>

      {/* Content */}
      <div className="p-5">

        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-signal/90">
          Vehicle Model
        </p>

        <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-tight text-charcoal">
          {vehicle.name}
        </h2>

        {/* Years */}
        <div className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
          <CalendarDays
            size={16}
            className="mt-0.5 shrink-0 text-signal"
          />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Compatible Years
            </p>

            <p className="mt-0.5 leading-relaxed">
              {vehicle.years?.length
                ? vehicle.years.join(", ")
                : "Year information unavailable"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-4">

          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Spare Parts
          </span>

          <Link
            to={`/shop?vehicle=${vehicle.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal transition-colors hover:text-signal"
          >
            Browse Parts

            <ChevronRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Vehicle Page
------------------------------------------------------- */

const VehiclePage = () => {
  const [searchParams] = useSearchParams();

  const brandId = searchParams.get("brand");

  const {
    data: vehicles = [],
    isLoading,
    isError,
    error,
  } = useQuery<VehicleModel[]>({
    queryKey: ["vehicle_models", brandId],

    queryFn: async () => {
      let query = supabase
        .from("vehicle_models")
        .select(
          "id,name,brand_id,vehicle_type,years,image_url"
        );

      if (brandId) {
        query = query.eq("brand_id", brandId);
      }

      const { data, error } = await query.order("name");

      if (error) {
        console.error(
          "[Supabase Error - Vehicle Models]",
          error
        );
        throw error;
      }
      return (data || []) as VehicleModel[];
    },
    staleTime: 1000 * 60 * 10,
  });

  /* -------------------------------------------------------
     Error State
  ------------------------------------------------------- */

  if (isError) {
    return (
      <Layout>
        <Helmet>
          <title>Vehicles – Stoic Automobiles</title>
        </Helmet>

        <main className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl rounded-md border border-destructive/20 bg-card p-8 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
              !
            </div>

            <p className="font-display text-xl font-bold uppercase tracking-tight">
              Unable to Load Vehicles
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {(error as any)?.message ??
                "An unknown error occurred while loading vehicle models."}
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal transition-colors hover:text-signal"
            >
              <ArrowLeft size={15} />
              Back to Home
            </Link>

          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>All Vehicles – Stoic Automobiles</title>

        <meta
          name="description"
          content="Browse all vehicle models we stock spare parts for. Filter by brand, type, or year."
        />
      </Helmet>

      {/* ---------------------------------------------------
          Hero
      --------------------------------------------------- */}

      <section className="relative overflow-hidden bg-charcoal-deep pt-20">

        {/* Background decoration */}
        <div className="absolute inset-0">

          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-signal/10 to-transparent" />

          <div className="absolute -right-20 top-10 h-72 w-72 rounded-full border border-signal/10" />

          <div className="absolute -right-10 top-20 h-52 w-52 rounded-full border border-signal/10" />

          <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-charcoal-deep to-transparent" />

        </div>

        <div className="container relative mx-auto px-4 py-16 md:py-20">

          <div className="max-w-3xl">

            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-sm border border-signal/40 bg-signal/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-signal">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />

              Vehicle Catalog

            </div>

            {/* Heading */}
            <h1 className="font-display text-4xl font-bold uppercase leading-[1.05] text-primary-foreground md:text-6xl">
              Find Your
              <br />
              <span className="text-signal">
                Vehicle.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/70 md:text-lg">
              Browse vehicle models and find genuine spare parts matched to
              your car, bike or commercial vehicle.
            </p>

            {/* Brand filter indicator */}
            {brandId && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-sm border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2 text-xs uppercase tracking-wider text-primary-foreground/80">
                <Car size={15} className="text-signal" />
                Showing vehicles for selected brand
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------
          Main Content
      --------------------------------------------------- */}

      <main className="bg-gradient-to-b from-background to-secondary/30">

        <div className="container mx-auto px-4 py-16 md:py-20">

          {/* Section Heading */}
          <div className="mb-10">

            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Vehicle Database
            </p>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-charcoal md:text-3xl">
                  Vehicle Models
                </h2>

                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Select a vehicle to explore compatible genuine spare parts.
                </p>

              </div>

              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {isLoading
                  ? "Loading..."
                  : `${vehicles.length} Models`}
              </div>

            </div>
          </div>

          {/* -------------------------------------------------
              Loading
          ------------------------------------------------- */}

          {isLoading ? (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {Array.from({ length: 8 }).map((_, i) => (
                <VehicleSkeleton key={i} />
              ))}

            </div>

          ) : vehicles.length === 0 ? (

            /* -----------------------------------------------
               Empty State
            ----------------------------------------------- */

            <div className="rounded-md border border-border bg-card p-10 text-center shadow-sm md:p-16">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-sm bg-signal/10 text-signal">
                <Car size={30} />
              </div>

              <p className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-charcoal">
                No Vehicles Found
              </p>

              <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                We couldn't find any vehicle models matching the selected
                criteria. Try viewing all vehicles or selecting another brand.
              </p>

              <Link
                to="/vehicle"
                className="mt-6 inline-flex items-center gap-2 rounded-sm bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-signal-deep"
              >
                View All Vehicles
                <ChevronRight size={15} />
              </Link>

            </div>

          ) : (

            /* -----------------------------------------------
               Vehicle Grid
            ----------------------------------------------- */

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                />
              ))}

            </div>
          )}

          {/* -------------------------------------------------
              Back Navigation
          ------------------------------------------------- */}

          <div className="mt-10 border-t border-border pt-6">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-charcoal"
            >
              <ArrowLeft
                size={15}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default VehiclePage;
