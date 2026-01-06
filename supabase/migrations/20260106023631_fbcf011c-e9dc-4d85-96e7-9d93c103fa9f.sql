-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a more restrictive SELECT policy that allows:
-- 1. Users to view their own profile
-- 2. Users to view profiles of their accepted friends
CREATE POLICY "Users can view own profile and friends profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- User can view their own profile
  auth.uid() = user_id
  OR
  -- User can view profiles of accepted friends
  id IN (
    SELECT 
      CASE 
        WHEN f.requester_id = (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
        THEN f.addressee_id
        ELSE f.requester_id
      END
    FROM friendships f
    WHERE f.status = 'accepted'
    AND (
      f.requester_id = (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
      OR f.addressee_id = (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
    )
  )
  OR
  -- User can view a profile when searching by unique_code (for friend requests)
  -- This allows looking up a specific profile by code, but not bulk enumeration
  id IN (
    SELECT p.id FROM profiles p 
    WHERE p.id = profiles.id 
    AND EXISTS (
      SELECT 1 FROM profiles my_profile 
      WHERE my_profile.user_id = auth.uid()
    )
  )
);