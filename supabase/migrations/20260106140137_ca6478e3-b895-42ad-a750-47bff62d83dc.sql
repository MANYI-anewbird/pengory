-- Recreate function using plpgsql and explicitly bypass RLS
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_id uuid;
BEGIN
  SELECT id INTO profile_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  RETURN profile_id;
END;
$$;