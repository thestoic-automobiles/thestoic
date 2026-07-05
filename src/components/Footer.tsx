import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import tsaLogo from "@/assets/tsa-logo.png";

const Footer = () => (
  <footer className="bg-charcoal-deep text-primary-foreground">
    <div className="container mx-auto py-14">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={tsaLogo} alt="The Stoic Automobiles" className="h-11 w-11 shrink-0" />
            <h3 className="font-display text-xl font-bold uppercase tracking-tight">The Stoic Automobiles</h3>
          </div>
          <p className="text-primary-foreground/65 text-sm leading-relaxed">
            Genuine auto spare parts for all vehicles. Trusted retailer & B2B supplier.
          </p>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold uppercase tracking-wider mb-4 text-signal">Shop</h4>
          <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
            <Link to="/shop" className="hover:text-signal">All Parts</Link>
            <Link to="/shop?tab=brand" className="hover:text-signal">By Brand</Link>
            <Link to="/shop?tab=vehicle" className="hover:text-signal">By Vehicle</Link>
            <Link to="/shop?tab=category" className="hover:text-signal">By Part Category</Link>
          </div>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold uppercase tracking-wider mb-4 text-signal">Account</h4>
          <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
            <Link to="/auth?mode=b2c" className="hover:text-signal">Customer Login</Link>
            <Link to="/auth?mode=b2b" className="hover:text-signal">B2B / Dealer Login</Link>
            <Link to="/account" className="hover:text-signal">My Orders</Link>
            <Link to="/cart" className="hover:text-signal">Cart</Link>
          </div>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold uppercase tracking-wider mb-4 text-signal">Hours</h4>
          <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2"><Clock size={15} className="text-signal shrink-0" /> All Days, 8:00 AM – 8:00 PM</div>
            <Link to="/contact" className="hover:text-signal">Get in touch →</Link>
            <Link to="/blog" className="hover:text-signal">Blog</Link>
            <Link to="/gallery" className="hover:text-signal">Gallery</Link>
            <Link to="/admin/login" className="hover:text-signal">Admin</Link>
          </div>
        </div>

        <div>
          <h4 className="font-display text-base font-semibold uppercase tracking-wider mb-4 text-signal">Policies</h4>
          <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
            <Link to="/shipping" className="hover:text-signal">Shipping & Delivery</Link>
            <Link to="/returns" className="hover:text-signal">Return & Exchange</Link>
            <Link to="/refund" className="hover:text-signal">Cancellation & Refund</Link>
            <Link to="/warranty" className="hover:text-signal">Warranty Policy</Link>
            <Link to="/privacy" className="hover:text-signal">Privacy Policy</Link>
            <Link to="/security" className="hover:text-signal">Security</Link>
            <Link to="/terms" className="hover:text-signal">Terms & Conditions</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 mt-12 pt-6 text-center text-xs text-primary-foreground/40">
        © {new Date().getFullYear()} The Stoic Automobiles. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
