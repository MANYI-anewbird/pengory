-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view friends profiles" ON public.profiles;

-- Create a security definer function to get current user's profile id
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Create simple policy for users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for viewing friends profiles using security definer function
CREATE POLICY "Users can view friends profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT 
      CASE 
        WHEN f.requester_id = public.get_my_profile_id() THEN f.addressee_id
        ELSE f.requester_id
      END
    FROM friendships f
    WHERE f.status IN ('accepted', 'pending')
    AND (f.requester_id = public.get_my_profile_id() OR f.addressee_id = public.get_my_profile_id())
  )
);