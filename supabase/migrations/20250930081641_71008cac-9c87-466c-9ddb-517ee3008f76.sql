-- Add phone_number to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create messages table for admin-student communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admins can view and send all messages
CREATE POLICY "Admins can manage messages"
ON messages
FOR ALL
TO authenticated
USING (check_is_admin());

-- Students can view their own messages
CREATE POLICY "Students can view their messages"
ON messages
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;