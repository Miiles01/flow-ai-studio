
-- Table: brand_programs
CREATE TABLE public.brand_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  commission_rate TEXT,
  program_url TEXT,
  logo_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view programs"
ON public.brand_programs FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER update_brand_programs_updated_at
BEFORE UPDATE ON public.brand_programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: user_applications
CREATE TABLE public.user_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES public.brand_programs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'saved',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_id)
);

ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
ON public.user_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
ON public.user_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
ON public.user_applications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
ON public.user_applications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Extend profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS niche TEXT;
