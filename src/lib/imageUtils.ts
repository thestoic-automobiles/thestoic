import catBody from "@/assets/categories/body-exterior.jpg";
import catBrakes from "@/assets/categories/brakes.jpg";
import catElec from "@/assets/categories/electricals.jpg";
import catEngine from "@/assets/categories/engine.jpg";
import catFilters from "@/assets/categories/filters.jpg";
import catLighting from "@/assets/categories/lighting.jpg";
import catLube from "@/assets/categories/lubricants.jpg";
import catSusp from "@/assets/categories/suspension.jpg";
import partsGrid from "@/assets/parts-grid.jpg";

export const CATEGORY_IMAGES: Record<string, string> = {
  "body-exterior": catBody,
  "body": catBody,
  "exterior": catBody,
  "brakes": catBrakes,
  "brake": catBrakes,
  "electricals": catElec,
  "electrical": catElec,
  "engine": catEngine,
  "filters": catFilters,
  "filter": catFilters,
  "lighting": catLighting,
  "lights": catLighting,
  "lubricants": catLube,
  "lubricant": catLube,
  "suspension": catSusp,
};

export const resolveCategoryImage = (
  imageUrl?: string | null,
  slug: string = "",
  name: string = ""
): string => {
  if (imageUrl && !imageUrl.startsWith("/__l5e") && (imageUrl.startsWith("http") || imageUrl.startsWith("data:") || imageUrl.startsWith("/assets/"))) {
    return imageUrl;
  }

  const key = `${slug || ""} ${name || ""}`.toLowerCase();
  if (key.includes("brake") || key.includes("disc") || key.includes("pad") || key.includes("rotor") || key.includes("shoe")) return catBrakes;
  if (key.includes("filter") || key.includes("cabin") || key.includes("intake") || key.includes("air")) return catFilters;
  if (key.includes("lube") || key.includes("oil") || key.includes("coolant") || key.includes("fluid") || key.includes("grease")) return catLube;
  if (key.includes("elec") || key.includes("battery") || key.includes("ignition") || key.includes("spark") || key.includes("starter") || key.includes("alternator")) return catElec;
  if (key.includes("light") || key.includes("lamp") || key.includes("bulb") || key.includes("headlight") || key.includes("fog") || key.includes("tail")) return catLighting;
  if (key.includes("susp") || key.includes("shock") || key.includes("absorber") || key.includes("strut") || key.includes("bush") || key.includes("spring") || key.includes("steering")) return catSusp;
  if (key.includes("engine") || key.includes("belt") || key.includes("mount") || key.includes("clutch") || key.includes("exhaust") || key.includes("timing") || key.includes("valve")) return catEngine;
  if (key.includes("body") || key.includes("exterior") || key.includes("bumper") || key.includes("mirror") || key.includes("door") || key.includes("grille") || key.includes("panel")) return catBody;

  if (slug && CATEGORY_IMAGES[slug.toLowerCase()]) {
    return CATEGORY_IMAGES[slug.toLowerCase()];
  }
  return catEngine;
};

export const resolveProductImage = (
  imageUrl?: string | null,
  name: string = "",
  categorySlug: string = ""
): string => {
  if (imageUrl && !imageUrl.startsWith("/__l5e") && (imageUrl.startsWith("http") || imageUrl.startsWith("data:") || imageUrl.startsWith("/assets/"))) {
    return imageUrl;
  }

  const n = (name + " " + categorySlug).toLowerCase();
  if (n.includes("brake") || n.includes("pad") || n.includes("rotor") || n.includes("shoe") || n.includes("disc")) return catBrakes;
  if (n.includes("filter") || n.includes("cabin") || n.includes("intake") || n.includes("air")) return catFilters;
  if (n.includes("oil") || n.includes("lube") || n.includes("coolant") || n.includes("fluid") || n.includes("grease")) return catLube;
  if (n.includes("battery") || n.includes("alternator") || n.includes("starter") || n.includes("spark") || n.includes("plug") || n.includes("sensor")) return catElec;
  if (n.includes("light") || n.includes("lamp") || n.includes("bulb") || n.includes("headlight") || n.includes("fog") || n.includes("tail")) return catLighting;
  if (n.includes("shock") || n.includes("suspension") || n.includes("absorber") || n.includes("bush") || n.includes("strut") || n.includes("spring")) return catSusp;
  if (n.includes("timing") || n.includes("belt") || n.includes("mount") || n.includes("engine") || n.includes("clutch") || n.includes("pump") || n.includes("valve")) return catEngine;
  if (n.includes("grille") || n.includes("bumper") || n.includes("mirror") || n.includes("handle") || n.includes("door") || n.includes("body") || n.includes("wiper")) return catBody;

  return partsGrid;
};
