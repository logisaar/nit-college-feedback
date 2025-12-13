-- Drop the old section check constraint on profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_section_check;

-- Add new section check constraint to include all sections A-J
ALTER TABLE public.profiles ADD CONSTRAINT profiles_section_check 
CHECK (section = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, 'F'::text, 'G'::text, 'H'::text, 'I'::text, 'J'::text]));

-- Also update the semester check constraint to include semesters 1-8
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_semester_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_semester_check 
CHECK (semester >= 1 AND semester <= 8);

-- Update the year check constraint to include years 1-4
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_year_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_year_check 
CHECK (year >= 1 AND year <= 4);