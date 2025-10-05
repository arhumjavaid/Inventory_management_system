-- Fix infinite recursion in RLS policies for user_profiles
-- This replaces the problematic policies with corrected versions

-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- Create corrected RLS policies

-- Policy 1: Users can ALWAYS view their own profile (no subquery needed)
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Admins can view all profiles
-- Use a security definer function to break the recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now use this function in policies (won't cause recursion due to SECURITY DEFINER)
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
USING (public.is_admin());

-- Policy 4: Admins can insert new users
CREATE POLICY "Admins can insert users"
ON public.user_profiles
FOR INSERT
WITH CHECK (public.is_admin());

-- Policy 5: Admins can update all users
CREATE POLICY "Admins can update all users"
ON public.user_profiles
FOR UPDATE
USING (public.is_admin());

-- Policy 6: Admins can delete users
CREATE POLICY "Admins can delete users"
ON public.user_profiles
FOR DELETE
USING (public.is_admin());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
