-- Add policy to allow admins to view all student profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (check_is_admin());