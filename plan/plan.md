# The Stoic Automobile — Phase 1 + 2

Pivoting the project from the Delhi Forest Department site to an auto‑parts e‑commerce storefront for **The Stoic Automobile**, Sinnar. Loose inspiration from partonwheels.com (Search by Brand / Vehicle / Part), fresh distinctive design.

## Phase 1 — Rebrand + Storefront UI (mock data first)

**Design direction**
- Automotive / industrial: deep charcoal + signal orange accent, sharp geometric type (e.g. Oswald / Inter), no resort serif.
- Replace forest imagery + green palette throughout `index.css`.

**Routes (rewrite `App.tsx`)**
- `/` Home — hero, three search tabs (Brand / Vehicle / Part), featured categories, featured parts, why-us, contact strip.
- `/shop` Catalog with filters (brand, vehicle, year, category).
- `/product/:id` Product detail (specs, compatible vehicles, manufacturing year, add‑to‑cart).
- `/cart` and `/checkout` (checkout = place order, payment stubbed for Phase 3).
- `/account` (orders, profile).
- `/auth` (B2C email+mobile, B2B customer code) — separate tabs.
- `/about`, `/contact`.
- Delete: `Rooms`, `Gallery`, `Blog`, `Careers`, `Legal`, `services/*`.

**Search-by-X**
- Tabbed control on home + `/shop`. Each tab is a chained dropdown:
  - Brand → Model → Part Category
  - Vehicle Type (Car/Bike/Truck) → Brand → Model → Year → Part
  - Part Category → Brand/Model
- All read from Cloud tables seeded with placeholder data.

**Components**
- `Navbar` updated: logo "The Stoic Automobile", cart icon, account, search.
- `Footer`: Sinnar address, phone, WhatsApp, email, business hours.
- `WhatsAppButton`: link to `https://wa.me/917387480081`.

## Phase 2 — Lovable Cloud backend

**Enable Lovable Cloud.** Then create tables (all in `public` with proper GRANTs + RLS):

```
brands(id, name, slug, logo_url)
vehicle_models(id, brand_id, name, type, years int[])
part_categories(id, name, slug)
products(id, sku, name, description, price_inr, stock, image_url,
         category_id, brand_id, mfg_year, compatible_model_ids uuid[])
profiles(id → auth.users, full_name, mobile, email, account_type 'b2c'|'b2b',
         customer_code unique nullable, gst_no nullable)
orders(id, user_id, status, total_inr, address jsonb, created_at)
order_items(order_id, product_id, qty, price_inr)
user_roles(user_id, role) + has_role() SECURITY DEFINER fn  -- for admin
```

**Auth**
- B2C: standard email + password signup; mobile captured into `profiles`.
- B2B: signup creates account with `account_type='b2b'` and a `customer_code`; B2B login form accepts customer code + password (resolved to email server‑side via edge function or by storing email mapping client‑side after lookup).
- Default Lovable Cloud email + Google sign‑in for B2C.
- Trigger auto‑creates `profiles` row on signup with metadata.

**RLS**
- Public read on `brands`, `vehicle_models`, `part_categories`, `products`.
- `profiles`, `orders`, `order_items`: owner‑only via `auth.uid()`.
- Admin (via `has_role`) can manage catalog + view all orders.

**Seed**
- ~6 brands, ~12 models, ~8 part categories, ~24 placeholder products with stock photos.

**Cart & checkout**
- Cart in `localStorage` (anon allowed); on checkout require login, then insert `orders` + `order_items`. Payment status = `pending`.

## Explicitly deferred to later phases (per your answers)

- **Phase 3:** Razorpay (BYOK) payment integration — needs your Key ID + Key Secret.
- **Phase 4:** WhatsApp + email order notifications (will use Lovable Emails for email; WhatsApp via Twilio or Meta Cloud API — needs creds).
- **Phase 5:** Delivery partner integration (Shiprocket / Delhivery — needs API key) + live GPS tracking page.

I will not touch payments, WhatsApp, delivery, or GPS in this pass.

## Technical notes

- All colors via semantic tokens in `index.css` — no hard‑coded hex in components.
- Form validation with `zod` (already in stack).
- Files removed via `rm`; routes pruned from `App.tsx`.
- Seed data inserted via `INSERT` (insert tool), not migrations.
- Razorpay keys (Phase 3) will be added as runtime secrets when we get there.

## Deliverables in this turn

1. Enable Lovable Cloud.
2. Migration: tables + RLS + grants + roles + signup trigger.
3. Seed catalog.
4. Rewrite design tokens + global styles.
5. New `Navbar`, `Footer`, `WhatsAppButton`, `Layout`.
6. New pages: `Index`, `Shop`, `Product`, `Cart`, `Checkout`, `Account`, `Auth`, `About`, `Contact`.
7. Delete unused template pages.
8. Wire `App.tsx` routes.

Approve and I'll build it.
