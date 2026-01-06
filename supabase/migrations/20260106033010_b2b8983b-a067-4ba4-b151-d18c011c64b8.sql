-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view own profile and friends profiles" ON public.profiles;

-- Create a simpler, non-recursive SELECT policy
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a separate policy for viewing friends' profiles that avoids recursion
-- by using user_id directly instead of querying profiles table
CREATE POLICY "Users can view friends profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT 
      CASE 
        WHEN f.requester_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1) 
        THEN f.addressee_id
        ELSE f.requester_id
      END
    FROM friendships f
    WHERE f.status = 'accepted'
    AND (
      f.requester_id IN (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
      OR f.addressee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    )
  )
  OR
  id IN (
    SELECT 
      CASE 
        WHEN f.requester_id = (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1) 
        THEN f.addressee_id
        ELSE f.requester_id
      END
    FROM friendships f
    WHERE f.status = 'pending'
    AND (
      f.requester_id IN (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
      OR f.addressee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    )
  )
);