
CREATE OR REPLACE FUNCTION public.get_email_by_customer_code(_code TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles
  WHERE customer_code = upper(_code)
    AND account_type = 'b2b'
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.get_email_by_customer_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_customer_code(TEXT) TO anon, authenticated;
