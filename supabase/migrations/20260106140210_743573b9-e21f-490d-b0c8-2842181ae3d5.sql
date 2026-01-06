-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view friends profiles" ON public.profiles;

-- Recreate it using auth.uid() directly instead of get_my_profile_id()
-- First we need to get profile_id from user_id in friendships check
CREATE POLICY "Users can view friends profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT 
      CASE 
        WHEN f.requester_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()) THEN f.addressee_id
        ELSE f.requester_id
      END
    FROM friendships f
    WHERE f.status IN ('accepted', 'pending')
    AND (
      f.requester_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
      OR f.addressee_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    )
  )
);