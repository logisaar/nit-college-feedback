-- Add cascade delete for faculty assignments when faculty is deleted
ALTER TABLE faculty_assignments
DROP CONSTRAINT IF EXISTS faculty_assignments_faculty_id_fkey,
ADD CONSTRAINT faculty_assignments_faculty_id_fkey 
  FOREIGN KEY (faculty_id) 
  REFERENCES faculty(id) 
  ON DELETE CASCADE;

-- Add cascade delete for ratings when faculty is deleted
ALTER TABLE ratings
DROP CONSTRAINT IF EXISTS ratings_faculty_id_fkey,
ADD CONSTRAINT ratings_faculty_id_fkey 
  FOREIGN KEY (faculty_id) 
  REFERENCES faculty(id) 
  ON DELETE CASCADE;

-- Add cascade delete for ratings when assignment is deleted
ALTER TABLE ratings
DROP CONSTRAINT IF EXISTS ratings_assignment_id_fkey,
ADD CONSTRAINT ratings_assignment_id_fkey 
  FOREIGN KEY (assignment_id) 
  REFERENCES faculty_assignments(id) 
  ON DELETE CASCADE;

-- Add cascade delete for ratings when student profile is deleted
ALTER TABLE ratings
DROP CONSTRAINT IF EXISTS ratings_student_id_fkey,
ADD CONSTRAINT ratings_student_id_fkey 
  FOREIGN KEY (student_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Add cascade delete for messages when student profile is deleted
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_student_id_fkey,
ADD CONSTRAINT messages_student_id_fkey 
  FOREIGN KEY (student_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;