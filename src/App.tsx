import { ReactNode, Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import Layout from "./components/Layout";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const Vehicle = lazy(() => import("./pages/Vehicle"));
const Account = lazy(() => import("./pages/Account"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Blog = lazy(() => import("./pages/Blog"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Terms = lazy(() => import("./pages/Terms"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Refund = lazy(() => import("./pages/Refund"));
const Returns = lazy(() => import("./pages/Returns"));
const Warranty = lazy(() => import("./pages/Warranty"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Security = lazy(() => import("./pages/Security"));

const queryClient = new QueryClient();

function AppLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-signal border-t-transparent" />
      <h2 className="mt-4 font-display text-lg font-bold uppercase tracking-wider text-charcoal">The Stoic Automobiles</h2>
      <p className="mt-1 text-xs text-muted-foreground">Loading...</p>
    </div>
  );
}

function RouteLoader({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AppLoader />}>{children}</Suspense>;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<RouteLoader><Index /></RouteLoader>} />
              <Route path="/home" element={<RouteLoader><Index /></RouteLoader>} />
              <Route path="/shop" element={<RouteLoader><Shop /></RouteLoader>} />
              <Route path="/product/:id" element={<RouteLoader><Product /></RouteLoader>} />
              <Route path="/vehicle" element={<RouteLoader><Vehicle /></RouteLoader>} />
              <Route path="/cart" element={<RouteLoader><Cart /></RouteLoader>} />
              <Route path="/checkout" element={<RouteLoader><Checkout /></RouteLoader>} />
              <Route path="/auth" element={<RouteLoader><Auth /></RouteLoader>} />
              <Route path="/account" element={<RouteLoader><Account /></RouteLoader>} />
              <Route path="/about" element={<RouteLoader><About /></RouteLoader>} />
              <Route path="/contact" element={<RouteLoader><Contact /></RouteLoader>} />
              <Route path="/blog" element={<RouteLoader><Blog /></RouteLoader>} />
              <Route path="/gallery" element={<RouteLoader><Gallery /></RouteLoader>} />
              <Route path="/terms" element={<RouteLoader><Terms /></RouteLoader>} />
              <Route path="/shipping" element={<RouteLoader><Shipping /></RouteLoader>} />
              <Route path="/refund" element={<RouteLoader><Refund /></RouteLoader>} />
              <Route path="/returns" element={<RouteLoader><Returns /></RouteLoader>} />
              <Route path="/warranty" element={<RouteLoader><Warranty /></RouteLoader>} />
              <Route path="/privacy" element={<RouteLoader><Privacy /></RouteLoader>} />
              <Route path="/security" element={<RouteLoader><Security /></RouteLoader>} />
              <Route path="/admin/login" element={<RouteLoader><AdminLogin /></RouteLoader>} />
              <Route path="/admin" element={<RouteLoader><Admin /></RouteLoader>} />
              <Route path="*" element={<RouteLoader><NotFound /></RouteLoader>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;