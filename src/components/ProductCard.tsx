import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Zap, ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type ProductCardData = {
  id: string;
  sku: string;
  name: string;
  price_inr: number;
  stock: number;
  image_url: string | null;
  mfg_year: number | null;
  brand?: { name: string } | null;
};

const ProductCard = ({ p }: { p: ProductCardData }) => {
  const { add } = useCart();
  const navigate = useNavigate();
  const inStock = p.stock > 0;

  const hasValidUrl = Boolean(
    p.image_url &&
    !p.image_url.startsWith("/__l5e") &&
    (p.image_url.startsWith("http://") || p.image_url.startsWith("https://") || p.image_url.startsWith("data:") || p.image_url.startsWith("/assets/"))
  );

  const [imgFailed, setImgFailed] = useState(!hasValidUrl);
  const addItem = () => add({ id: p.id, name: p.name, price_inr: Number(p.price_inr), image_url: !imgFailed ? p.image_url : null });

  return (
    <div className="group bg-white border border-border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <Link to={`/product/${p.id}`} className="block relative">
        {p.brand?.name && (
          <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold uppercase tracking-wider bg-white/95 backdrop-blur px-2 py-1 rounded-full border border-border text-charcoal">
            {p.brand.name}
          </span>
        )}
        {!inStock && (
          <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-wider bg-destructive/95 text-destructive-foreground px-2 py-1 rounded-full">
            Out of stock
          </span>
        )}
        <div className="aspect-square bg-gradient-to-br from-secondary/40 to-white flex items-center justify-center p-6 overflow-hidden">
          {!imgFailed && p.image_url ? (
            <img
              src={p.image_url}
              alt={p.name}
              onError={() => setImgFailed(true)}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 rounded-md"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full relative rounded-md overflow-hidden flex items-center justify-center">
              <Skeleton className="w-full h-full absolute inset-0" />
              <div className="relative z-10 flex flex-col items-center justify-center text-muted-foreground/50 gap-1.5">
                <ImageOff size={24} className="stroke-[1.5]" />
                <span className="text-[10px] font-mono uppercase tracking-widest">{p.sku.split("-")[1] || p.sku}</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 text-center border-t border-border/60">
        <Link to={`/product/${p.id}`} className="flex-1">
          <h3 className="font-display text-sm font-semibold leading-snug line-clamp-2 text-charcoal hover:text-signal transition-colors min-h-[2.5rem]">
            {p.name}
          </h3>
        </Link>
        {p.mfg_year && (
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
            Mfg {p.mfg_year}
          </p>
        )}
        <p className="font-display text-lg font-bold text-signal mt-2">
          ₹{Number(p.price_inr).toLocaleString("en-IN")}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full border-signal text-signal hover:bg-signal hover:text-white"
            onClick={() => {
              addItem();
              toast.success(`${p.name} added to cart`);
            }}
            disabled={!inStock}
          >
            <ShoppingCart size={14} /> Add
          </Button>
          <Button
            size="sm"
            className="w-full bg-signal hover:bg-signal-deep text-white"
            onClick={() => {
              addItem();
              navigate("/checkout");
            }}
            disabled={!inStock}
          >
            <Zap size={14} /> Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
