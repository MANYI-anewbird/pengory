-- Add DELETE policy for pk_challenges table
-- Users can delete challenges where they are either the challenger or the challenged party
CREATE POLICY "Users can delete their PK challenges" 
ON public.pk_challenges 
FOR DELETE 
TO authenticated
USING (
  challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR challenged_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);