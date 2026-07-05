
-- 1. Add "processing" status
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'processing' BEFORE 'paid';

-- 2. Product pricing extras
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS mrp_inr numeric,
  ADD COLUMN IF NOT EXISTS discount_pct numeric DEFAULT 0;

-- 3. Admin (anon) policies for order management
CREATE POLICY "orders_admin_read_all"
ON public.orders FOR SELECT
TO anon
USING (true);

CREATE POLICY "orders_admin_update_all"
ON public.orders FOR UPDATE
TO anon
USING (true) WITH CHECK (true);

CREATE POLICY "order_items_admin_read_all"
ON public.order_items FOR SELECT
TO anon
USING (true);

GRANT SELECT, UPDATE ON public.orders TO anon;
GRANT SELECT ON public.order_items TO anon;
