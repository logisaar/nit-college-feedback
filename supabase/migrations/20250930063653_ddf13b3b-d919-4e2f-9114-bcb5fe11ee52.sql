-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage faculty" ON public.faculty;
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.faculty_assignments;
DROP POLICY IF EXISTS "Admins can view all ratings" ON public.ratings;

-- Create security definer function to check admin role (prevents recursion)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.check_is_admin());

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage faculty"
ON public.faculty
FOR ALL
USING (public.check_is_admin());

CREATE POLICY "Admins can manage assignments"
ON public.faculty_assignments
FOR ALL
USING (public.check_is_admin());

CREATE POLICY "Admins can view all ratings"
ON public.ratings
FOR SELECT
USING (public.check_is_admin());