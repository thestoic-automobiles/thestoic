
-- 1. Restrict EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_email_by_customer_code(text) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_customer_code(text) TO anon;

-- 2. Owner-scoped UPDATE/DELETE on orders (only while pending)
CREATE POLICY "orders_self_update" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_self_delete" ON public.orders
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- 3. Owner-scoped UPDATE/DELETE on order_items (only for owner's pending orders)
CREATE POLICY "order_items_self_update" ON public.order_items
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid() AND o.status = 'pending'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid() AND o.status = 'pending'));

CREATE POLICY "order_items_self_delete" ON public.order_items
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid() AND o.status = 'pending'));

-- 4. Explicitly deny all writes to user_roles from anon/authenticated (service_role bypasses RLS)
CREATE POLICY "user_roles_no_insert" ON public.user_roles
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "user_roles_no_update" ON public.user_roles
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "user_roles_no_delete" ON public.user_roles
  FOR DELETE TO anon, authenticated USING (false);
