
CREATE POLICY "brands_admin_write" ON public.brands FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT INSERT, UPDATE, DELETE ON public.brands TO anon, authenticated;

CREATE POLICY "models_admin_write" ON public.vehicle_models FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
GRANT INSERT, UPDATE, DELETE ON public.vehicle_models TO anon, authenticated;
