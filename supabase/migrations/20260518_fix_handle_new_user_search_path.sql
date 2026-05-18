-- Fix handle_new_user trigger: add SET search_path = public so GoTrue's admin
-- context can resolve the `profiles` table without schema qualification.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, role, email)
  VALUES (new.id, 'cliente', new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
