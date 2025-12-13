
-- Update section check constraint to allow all sections A through J
ALTER TABLE faculty_assignments DROP CONSTRAINT IF EXISTS faculty_assignments_section_check;
ALTER TABLE faculty_assignments ADD CONSTRAINT faculty_assignments_section_check 
CHECK (section = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, 'F'::text, 'G'::text, 'H'::text, 'I'::text, 'J'::text]));
