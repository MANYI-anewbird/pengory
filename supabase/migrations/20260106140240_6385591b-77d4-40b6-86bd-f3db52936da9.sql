-- Drop the problematic policy first
DROP POLICY IF EXISTS "Users can view friends profiles" ON public.profiles;

-- Create a helper function that safely gets profile ID without triggering RLS
CREATE OR REPLACE FUNCTION public.get_profile_id_for_user(uid uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result uuid;
BEGIN
  SELECT id INTO result FROM public.profiles WHERE user_id = uid LIMIT 1;
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_profile_id_for_user(uuid) TO authenticated;

-- Recreate the policy using the new function instead of subqueries on profiles
CREATE POLICY "Users can view friends profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT 
      CASE 
        WHEN f.requester_id = public.get_profile_id_for_user(auth.uid()) THEN f.addressee_id
        ELSE f.requester_id
      END
    FROM public.friendships f
    WHERE f.status IN ('accepted', 'pending')
    AND (
      f.requester_id = public.get_profile_id_for_user(auth.uid())
      OR f.addressee_id = public.get_profile_id_for_user(auth.uid())
    )
  )
);