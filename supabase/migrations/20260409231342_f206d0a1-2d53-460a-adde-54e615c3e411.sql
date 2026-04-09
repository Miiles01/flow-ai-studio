
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Users can read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert brand programs
CREATE POLICY "Admins can insert programs"
ON public.brand_programs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update brand programs
CREATE POLICY "Admins can update programs"
ON public.brand_programs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete brand programs
CREATE POLICY "Admins can delete programs"
ON public.brand_programs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert admin role for contmanuel77@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'contmanuel77@gmail.com'
ON CONFLICT DO NOTHING;

-- Delete all example brand programs
DELETE FROM public.brand_programs;
