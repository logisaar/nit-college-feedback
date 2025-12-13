-- Create hostel_ratings table
CREATE TABLE public.hostel_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accommodation_rooms INTEGER NOT NULL CHECK (accommodation_rooms >= 1 AND accommodation_rooms <= 5),
  washrooms_hygiene INTEGER NOT NULL CHECK (washrooms_hygiene >= 1 AND washrooms_hygiene <= 5),
  mess_food_quality INTEGER NOT NULL CHECK (mess_food_quality >= 1 AND mess_food_quality <= 5),
  safety_security INTEGER NOT NULL CHECK (safety_security >= 1 AND safety_security <= 5),
  hostel_staff_behaviour INTEGER NOT NULL CHECK (hostel_staff_behaviour >= 1 AND hostel_staff_behaviour <= 5),
  maintenance_facilities INTEGER NOT NULL CHECK (maintenance_facilities >= 1 AND maintenance_facilities <= 5),
  wifi_connectivity INTEGER NOT NULL CHECK (wifi_connectivity >= 1 AND wifi_connectivity <= 5),
  discipline_rules INTEGER NOT NULL CHECK (discipline_rules >= 1 AND discipline_rules <= 5),
  medical_facilities INTEGER NOT NULL CHECK (medical_facilities >= 1 AND medical_facilities <= 5),
  overall_living_experience INTEGER NOT NULL CHECK (overall_living_experience >= 1 AND overall_living_experience <= 5),
  feedback_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hostel_ratings ENABLE ROW LEVEL SECURITY;

-- Students can insert their own hostel rating
CREATE POLICY "Students can insert their own hostel rating"
ON public.hostel_ratings
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Students can update their own hostel rating
CREATE POLICY "Students can update their own hostel rating"
ON public.hostel_ratings
FOR UPDATE
USING (auth.uid() = student_id);

-- Students can view their own hostel rating
CREATE POLICY "Students can view their own hostel rating"
ON public.hostel_ratings
FOR SELECT
USING (auth.uid() = student_id);

-- Admins can view all hostel ratings
CREATE POLICY "Admins can view all hostel ratings"
ON public.hostel_ratings
FOR SELECT
USING (check_is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_hostel_ratings_updated_at
BEFORE UPDATE ON public.hostel_ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();