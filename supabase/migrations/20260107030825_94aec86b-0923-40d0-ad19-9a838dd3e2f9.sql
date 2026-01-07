-- Fix infinite recursion in profiles SELECT policy by avoiding self-referential subqueries
-- Recreate the friends visibility policy using the security definer helper.

DROP POLICY IF EXISTS "Users can view friends profiles" ON public.profiles;

CREATE POLICY "Users can view friends profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.friendships f
    WHERE f.status = ANY (ARRAY['accepted'::text, 'pending'::text])
      AND (
        (f.requester_id = public.get_my_profile_id() AND f.addressee_id = profiles.id)
        OR
        (f.addressee_id = public.get_my_profile_id() AND f.requester_id = profiles.id)
      )
  )
);
