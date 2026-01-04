-- Drop existing comments policies
DROP POLICY IF EXISTS "Users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- Create new policy: Users can only view comments where they are sender/recipient AND friendship exists
CREATE POLICY "Users can view comments between friends" 
ON public.comments 
FOR SELECT 
TO authenticated
USING (
  -- User must be sender or recipient
  (from_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
   OR to_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  -- AND an accepted friendship must exist between the two profiles
  AND EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND ((requester_id = from_profile_id AND addressee_id = to_profile_id)
      OR (requester_id = to_profile_id AND addressee_id = from_profile_id))
  )
);

-- Create new policy: Users can only create comments to friends
CREATE POLICY "Users can create comments to friends" 
ON public.comments 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- User must be the sender
  from_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  -- AND an accepted friendship must exist with the recipient
  AND EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND ((requester_id = from_profile_id AND addressee_id = to_profile_id)
      OR (requester_id = to_profile_id AND addressee_id = from_profile_id))
  )
);

-- Recreate delete policy (unchanged, but ensures consistency)
CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
TO authenticated
USING (from_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));