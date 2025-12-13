
-- Remove unique constraint on faculty email to allow multiple faculty with same email
ALTER TABLE faculty DROP CONSTRAINT IF EXISTS faculty_email_key;
