-- Create tasks table for shareable daily tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes table for encouraging friends
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_profile_id, to_profile_id, target_date)
);

-- Create comments table for friend interactions
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PK challenges table
CREATE TABLE public.pk_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pk_challenges ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can manage their own tasks"
ON public.tasks FOR ALL
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Friends can view shared tasks"
ON public.tasks FOR SELECT
USING (
  is_shared = true AND
  profile_id IN (
    SELECT CASE 
      WHEN requester_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) THEN addressee_id
      ELSE requester_id
    END
    FROM friendships
    WHERE status = 'accepted'
    AND (requester_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
         OR addressee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  )
);

-- Likes policies
CREATE POLICY "Users can create likes"
ON public.likes FOR INSERT
WITH CHECK (from_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view likes"
ON public.likes FOR SELECT
USING (
  from_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR to_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own likes"
ON public.likes FOR DELETE
USING (from_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Comments policies
CREATE POLICY "Users can create comments"
ON public.comments FOR INSERT
WITH CHECK (from_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view comments"
ON public.comments FOR SELECT
USING (
  from_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR to_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (from_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- PK challenges policies
CREATE POLICY "Users can create PK challenges"
ON public.pk_challenges FOR INSERT
WITH CHECK (challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their PK challenges"
ON public.pk_challenges FOR SELECT
USING (
  challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR challenged_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their PK challenges"
ON public.pk_challenges FOR UPDATE
USING (
  challenger_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR challenged_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Add triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pk_challenges_updated_at
BEFORE UPDATE ON public.pk_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();