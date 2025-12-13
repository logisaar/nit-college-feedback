import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/StarRating";
import { Home, ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HostelRatings {
  accommodation_rooms: number;
  washrooms_hygiene: number;
  mess_food_quality: number;
  safety_security: number;
  hostel_staff_behaviour: number;
  maintenance_facilities: number;
  wifi_connectivity: number;
  discipline_rules: number;
  medical_facilities: number;
  overall_living_experience: number;
}

export default function HostelFeedback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);
  
  const defaultRatings: HostelRatings = {
    accommodation_rooms: 1,
    washrooms_hygiene: 1,
    mess_food_quality: 1,
    safety_security: 1,
    hostel_staff_behaviour: 1,
    maintenance_facilities: 1,
    wifi_connectivity: 1,
    discipline_rules: 1,
    medical_facilities: 1,
    overall_living_experience: 1,
  };

  const [ratings, setRatings] = useState<HostelRatings>(defaultRatings);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/student-login");
        return;
      }

      // Check for existing rating
      const { data: existing, error } = await supabase
        .from("hostel_ratings")
        .select("*")
        .eq("student_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (existing) {
        setExistingRating(existing);
        setRatings({
          accommodation_rooms: existing.accommodation_rooms,
          washrooms_hygiene: existing.washrooms_hygiene,
          mess_food_quality: existing.mess_food_quality,
          safety_security: existing.safety_security,
          hostel_staff_behaviour: existing.hostel_staff_behaviour,
          maintenance_facilities: existing.maintenance_facilities,
          wifi_connectivity: existing.wifi_connectivity,
          discipline_rules: existing.discipline_rules,
          medical_facilities: existing.medical_facilities,
          overall_living_experience: existing.overall_living_experience,
        });
        setFeedbackMessage(existing.feedback_message || "");
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (existingRating) {
        // Check cooldown (5 minutes)
        const lastSubmitTime = new Date(existingRating.updated_at).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        const timeRemaining = fiveMinutes - (now - lastSubmitTime);

        if (timeRemaining > 0) {
          const minutesLeft = Math.ceil(timeRemaining / 60000);
          const secondsLeft = Math.ceil((timeRemaining % 60000) / 1000);
          toast.error(`Please wait ${minutesLeft > 0 ? `${minutesLeft}m ` : ''}${secondsLeft}s before resubmitting`);
          setSubmitting(false);
          return;
        }

        // Update existing
        const { error } = await supabase
          .from("hostel_ratings")
          .update({
            ...ratings,
            feedback_message: feedbackMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRating.id);

        if (error) throw error;
        toast.success("Hostel feedback updated successfully!");
      } else {
        // Insert new
        const { error } = await supabase
          .from("hostel_ratings")
          .insert({
            student_id: user.id,
            ...ratings,
            feedback_message: feedbackMessage,
          });

        if (error) throw error;
        toast.success("Hostel feedback submitted successfully!");
      }

      navigate("/student-dashboard");
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Hostel Feedback</h1>
              <p className="text-sm text-muted-foreground">Rate your hostel experience</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/student-dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 card-elegant">
            <h2 className="text-2xl font-bold mb-2 gradient-text">Hostel Feedback Criteria</h2>
            <p className="text-muted-foreground mb-6">
              Please rate your hostel experience on the following criteria
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <StarRating
                label="1. Accommodation & Rooms"
                description="Room quality, furniture, and living space"
                value={ratings.accommodation_rooms}
                onChange={(value) => setRatings({ ...ratings, accommodation_rooms: value })}
              />
              <StarRating
                label="2. Washrooms & Hygiene"
                description="Cleanliness and maintenance of washrooms"
                value={ratings.washrooms_hygiene}
                onChange={(value) => setRatings({ ...ratings, washrooms_hygiene: value })}
              />
              <StarRating
                label="3. Mess & Food Quality"
                description="Quality, variety, and hygiene of food"
                value={ratings.mess_food_quality}
                onChange={(value) => setRatings({ ...ratings, mess_food_quality: value })}
              />
              <StarRating
                label="4. Safety & Security"
                description="Security measures and safety protocols"
                value={ratings.safety_security}
                onChange={(value) => setRatings({ ...ratings, safety_security: value })}
              />
              <StarRating
                label="5. Hostel Staff Behaviour"
                description="Helpfulness and professionalism of staff"
                value={ratings.hostel_staff_behaviour}
                onChange={(value) => setRatings({ ...ratings, hostel_staff_behaviour: value })}
              />
              <StarRating
                label="6. Maintenance & Facilities"
                description="Upkeep of facilities and timely repairs"
                value={ratings.maintenance_facilities}
                onChange={(value) => setRatings({ ...ratings, maintenance_facilities: value })}
              />
              <StarRating
                label="7. Wi-Fi & Connectivity"
                description="Internet speed and reliability"
                value={ratings.wifi_connectivity}
                onChange={(value) => setRatings({ ...ratings, wifi_connectivity: value })}
              />
              <StarRating
                label="8. Discipline & Rules"
                description="Fair and reasonable hostel rules"
                value={ratings.discipline_rules}
                onChange={(value) => setRatings({ ...ratings, discipline_rules: value })}
              />
              <StarRating
                label="9. Medical Facilities"
                description="Access to medical care and first aid"
                value={ratings.medical_facilities}
                onChange={(value) => setRatings({ ...ratings, medical_facilities: value })}
              />
              <StarRating
                label="10. Overall Living Experience"
                description="Your overall satisfaction with hostel life"
                value={ratings.overall_living_experience}
                onChange={(value) => setRatings({ ...ratings, overall_living_experience: value })}
              />
            </div>

            <div className="space-y-2 mb-6">
              <Label>Additional Feedback / Suggestions</Label>
              <Textarea
                placeholder="Share any specific comments, concerns, or suggestions to improve the hostel..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full btn-gradient"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> {existingRating ? "Update Feedback" : "Submit Feedback"}</>
              )}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
