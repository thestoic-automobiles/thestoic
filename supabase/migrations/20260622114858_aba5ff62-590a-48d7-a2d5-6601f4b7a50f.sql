CREATE POLICY "products_admin_read_all" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "part_categories_admin_write" ON public.part_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT INSERT, UPDATE, DELETE ON public.part_categories TO anon, authenticated;