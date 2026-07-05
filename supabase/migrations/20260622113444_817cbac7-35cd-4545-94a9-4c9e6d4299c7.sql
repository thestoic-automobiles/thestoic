
-- Allow inventory management from the client-side admin panel.
-- NOTE: This opens products to anonymous writes. Combined with the
-- hardcoded-credential admin panel, this is convenient but not secure;
-- if stricter security is needed later, move writes behind an edge
-- function authenticated by a shared secret.

CREATE POLICY "products_admin_insert"
ON public.products FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "products_admin_update"
ON public.products FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "products_admin_delete"
ON public.products FOR DELETE
TO anon, authenticated
USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
