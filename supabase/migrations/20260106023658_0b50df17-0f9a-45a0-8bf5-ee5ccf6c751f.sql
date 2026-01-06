-- Drop the flawed policy and recreate properly
DROP POLICY IF EXISTS "Users can view own profile and friends profiles" ON public.profiles;

-- Create a proper restrictive SELECT policy that allows:
-- 1. Users to view their own profile
-- 2. Users to view profiles of their accepted friends
-- 3. Users to view profiles they're searching for by unique_code (pending friend requests)
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
  -- User can view profiles involved in pending friendships with them
  id IN (
    SELECT 
      CASE 
        WHEN f.requester_id = (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
        THEN f.addressee_id
        ELSE f.requester_id
      END
    FROM friendships f
    WHERE f.status = 'pending'
    AND (
      f.requester_id = (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
      OR f.addressee_id = (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
    )
  )
);