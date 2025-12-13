-- Add DELETE policy for admins on profiles table
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (check_is_admin());

-- Add policy for admins to delete from auth.users related data
-- First, let's ensure ratings can be deleted when a student is deleted
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_student_id_fkey;
ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Ensure messages can be deleted when a student is deleted
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_student_id_fkey;
ALTER TABLE public.messages 
ADD CONSTRAINT messages_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;