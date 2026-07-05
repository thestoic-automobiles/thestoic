import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Mail, ShoppingCart, User, Search, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import tsaLogo from "@/assets/tsa-logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [location]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); navigate("/"); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="hidden md:block bg-charcoal-deep text-primary-foreground/80 text-xs">
        <div className="container mx-auto flex items-center justify-between py-2 gap-4">
          <a href="mailto:supportthestoic@gmail.com" className="inline-flex items-center gap-2 hover:text-signal">
            <Mail size={12} className="text-signal" /> supportthestoic@gmail.com
          </a>
          <span className="hidden lg:inline">All Days 8:00 AM – 8:00 PM</span>
          <a href="tel:+917387480081" className="inline-flex items-center gap-2 hover:text-signal">
            <Phone size={12} className="text-signal" /> +91 73874 80081
          </a>
        </div>
      </div>

      <nav className={`transition-all duration-300 bg-background border-b border-border ${scrolled ? "shadow-md py-2" : "py-3"}`}>
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={tsaLogo} alt="The Stoic Automobiles" className="h-11 w-11 shrink-0" width={44} height={44} />
            <div className="leading-tight min-w-0">
              <p className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-charcoal truncate">The Stoic Automobiles</p>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground truncate">Genuine Auto Spares</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium uppercase tracking-wide transition-colors hover:text-signal ${location.pathname === l.to ? "text-signal" : "text-charcoal"}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => navigate("/shop")}>
              <Search size={18} />
            </Button>

            {email ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account"><User size={18} /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">{email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account")}>My Account & Orders</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/cart")}>Cart</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}><LogOut size={14} className="mr-2" /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" aria-label="Account" onClick={() => navigate("/auth")}>
                <User size={18} />
              </Button>
            )}

            <Button variant="ghost" size="icon" aria-label="Cart" onClick={() => navigate("/cart")} className="relative">
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-signal text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Button>
            <button className="lg:hidden text-charcoal ml-1" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden bg-background border-t border-border animate-fade-in">
            <div className="container mx-auto py-3 flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className={`py-2 text-sm font-medium uppercase tracking-wide ${location.pathname === l.to ? "text-signal" : "text-charcoal"}`}>
                  {l.label}
                </Link>
              ))}
              {!email && (
                <>
                  <Link to="/auth" className="py-2 text-sm font-medium uppercase tracking-wide text-charcoal">Sign In</Link>
                  <Link to="/auth?tab=signup" className="py-2 text-sm font-medium uppercase tracking-wide text-signal">Create Account</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
