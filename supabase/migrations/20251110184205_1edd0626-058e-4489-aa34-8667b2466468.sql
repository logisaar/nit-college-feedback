-- Revert the previous changes and set up correct foreign keys
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_student_id_fkey;
ALTER TABLE public.ratings 
ADD CONSTRAINT ratings_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_student_id_fkey;
ALTER TABLE public.messages 
ADD CONSTRAINT messages_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;