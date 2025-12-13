-- Update existing faculty assignments with incorrect branch names
UPDATE faculty_assignments 
SET branch = 'Computer Science' 
WHERE branch IN ('cst', 'CSE', 'cs', 'CS');