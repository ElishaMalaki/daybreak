-- Repair admin portal visibility after security hardening.
-- Admin access is allowed when either immutable app metadata marks the user as admin
-- or the server-managed public.user_profiles.role is admin.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
SELECT EXISTS (
    SELECT 1
    FROM auth.users au
    WHERE au.id = auth.uid()
      AND au.raw_app_meta_data->>'role' = 'admin'
)
OR EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
      AND up.role = 'admin'::public.user_role
)
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
