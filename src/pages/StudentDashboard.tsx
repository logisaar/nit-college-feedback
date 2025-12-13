import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/StarRating";
import { GraduationCap, LogOut, Loader2, Send, ArrowLeft, MessageCircle, History, Star, Home } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  full_name: string;
  registration_number: string;
  year: number;
  semester: number;
  section: string;
  branch: string;
}

interface FacultyAssignment {
  id: string;
  subject: string;
  faculty: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

interface RatingHistory {
  id: string;
  created_at: string;
  engagement_level: number;
  concept_understanding: number;
  content_depth: number;
  application_teaching: number;
  pedagogy_tools: number;
  communication_skills: number;
  class_decorum: number;
  teaching_aids: number;
  feedback_message: string | null;
  faculty: {
    name: string;
  };
  faculty_assignments: {
    subject: string;
  };
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [facultyAssignments, setFacultyAssignments] = useState<FacultyAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const defaultRatings = {
    engagement_level: 1,
    concept_understanding: 1,
    content_depth: 1,
    application_teaching: 1,
    pedagogy_tools: 1,
    communication_skills: 1,
    class_decorum: 1,
    teaching_aids: 1
  };
  const [ratings, setRatings] = useState(defaultRatings);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [ratingHistory, setRatingHistory] = useState<RatingHistory[]>([]);

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription for messages
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const channel = supabase
          .channel('student-messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `student_id=eq.${user.id}`
            },
            () => {
              loadMessages(user.id);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };
    
    setupSubscription();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/student-login");
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load faculty assignments for student's class
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("faculty_assignments")
        .select(`
          id,
          subject,
          faculty:faculty_id (
            id,
            name,
            email,
            department
          )
        `)
        .eq("year", profileData.year)
        .eq("semester", profileData.semester)
        .eq("section", profileData.section)
        .eq("branch", profileData.branch);

      if (assignmentsError) throw assignmentsError;
      setFacultyAssignments(assignmentsData as any);
      
      // Load messages
      await loadMessages(user.id);
      
      // Load rating history
      await loadRatingHistory(user.id);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("student_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
      
      // Mark unread messages as read
      const unreadIds = data?.filter(m => !m.read_at).map(m => m.id) || [];
      if (unreadIds.length > 0) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
    }
  };

  const loadRatingHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("ratings")
        .select(`
          id,
          created_at,
          engagement_level,
          concept_understanding,
          content_depth,
          application_teaching,
          pedagogy_tools,
          communication_skills,
          class_decorum,
          teaching_aids,
          feedback_message,
          faculty:faculty_id (name),
          faculty_assignments:assignment_id (subject)
        `)
        .eq("student_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRatingHistory(data as any || []);
    } catch (error: any) {
      console.error("Error loading rating history:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) {
      toast.error("Please select a faculty member");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const assignment = facultyAssignments.find(a => a.id === selectedAssignment);
      if (!assignment) throw new Error("Assignment not found");

      // Check for existing rating
      const { data: existingRating, error: checkError } = await supabase
        .from("ratings")
        .select("id, created_at")
        .eq("student_id", user.id)
        .eq("assignment_id", selectedAssignment)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRating) {
        // Check if 5 minutes have passed since last submission
        const lastSubmitTime = new Date(existingRating.created_at).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        const timeRemaining = fiveMinutes - (now - lastSubmitTime);

        if (timeRemaining > 0) {
          const minutesLeft = Math.ceil(timeRemaining / 60000);
          const secondsLeft = Math.ceil((timeRemaining % 60000) / 1000);
          toast.error(`Please wait ${minutesLeft > 0 ? `${minutesLeft}m ` : ''}${secondsLeft}s before resubmitting rating for this faculty`);
          setSubmitting(false);
          return;
        }

        // Update existing rating
        const { error } = await supabase
          .from("ratings")
          .update({
            ...ratings,
            feedback_message: feedbackMessage,
            created_at: new Date().toISOString()
          })
          .eq("id", existingRating.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
          .from("ratings")
          .insert({
            student_id: user.id,
            faculty_id: assignment.faculty.id,
            assignment_id: selectedAssignment,
            ...ratings,
            feedback_message: feedbackMessage
          });

        if (error) throw error;
      }

      toast.success("Feedback submitted successfully!");
      setFeedbackMessage("");
      setSelectedAssignment("");
      setRatings(defaultRatings);
      
      // Reload rating history
      await loadRatingHistory(user.id);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/student-login");
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
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Faculty Feedback System</h1>
              <p className="text-sm text-muted-foreground">Student Portal</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Student Info Card */}
          <Card className="p-6 card-elegant">
            <h2 className="text-2xl font-bold mb-4 gradient-text">Student Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration Number</p>
                <p className="font-semibold">{profile?.registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-semibold">{profile?.branch}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year & Semester</p>
                <p className="font-semibold">Year {profile?.year}, Semester {profile?.semester}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Section</p>
                <p className="font-semibold">Section {profile?.section}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button 
                onClick={() => navigate("/hostel-feedback")} 
                variant="outline"
                className="w-full md:w-auto"
              >
                <Home className="mr-2 h-4 w-4" />
                Hostel Feedback
              </Button>
            </div>
          </Card>

          {/* Rating Form */}
          <Card className="p-6 card-elegant">
            <h2 className="text-2xl font-bold mb-2 gradient-text">Rate Faculty Performance</h2>
            <p className="text-muted-foreground mb-6">Provide feedback to help improve teaching quality</p>

            <div className="space-y-6">
              <div>
                <Label>Select Faculty & Subject</Label>
                <Select value={selectedAssignment} onValueChange={setSelectedAssignment} disabled={facultyAssignments.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={facultyAssignments.length === 0 ? "No faculty assigned yet" : "Choose faculty and subject to rate"} />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyAssignments.length === 0 ? (
                      <SelectItem value="no-faculty" disabled>
                        No faculty assigned to your class yet
                      </SelectItem>
                    ) : (
                      facultyAssignments.map((assignment) => (
                        <SelectItem key={assignment.id} value={assignment.id}>
                          {assignment.faculty.name} - {assignment.subject}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedAssignment && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <StarRating
                      label="Course Content Delivery.



"
                      description="How well does the faculty engage students?"
                      value={ratings.engagement_level}
                      onChange={(value) => setRatings({ ...ratings, engagement_level: value })}
                    />
                    <StarRating
                      label="
Use of Innovative Teaching Methods (ICT, Labs, Case Studies)e"
                      description="Clarity in explaining concepts"
                      value={ratings.concept_understanding}
                      onChange={(value) => setRatings({ ...ratings, concept_understanding: value })}
                    />
                    <StarRating
                      label="Syllabus Completion on Time"
                      description="Coverage and depth of subject matter"
                      value={ratings.content_depth}
                      onChange={(value) => setRatings({ ...ratings, content_depth: value })}
                    />
                    <StarRating
                      label="Mentoring and Counseling of Students"
                      description="Real-world application focus"
                      value={ratings.application_teaching}
                      onChange={(value) => setRatings({ ...ratings, application_teaching: value })}
                    />
                    <StarRating
                      label="
Classroom Engagement & Interaction"
                      description="Teaching methods and tools used"
                      value={ratings.pedagogy_tools}
                      onChange={(value) => setRatings({ ...ratings, pedagogy_tools: value })}
                    />
                    <StarRating
                      label="
Subject Knowledge & Expertise"
                      description="Clarity and effectiveness of communication"
                      value={ratings.communication_skills}
                      onChange={(value) => setRatings({ ...ratings, communication_skills: value })}
                    />
                    <StarRating
                      label="Class Decorum"
                      description="Classroom management and environment"
                      value={ratings.class_decorum}
                      onChange={(value) => setRatings({ ...ratings, class_decorum: value })}
                    />
                    <StarRating
                      label="Punctuality & Regularity"
                      description="Use of visual aids and technology"
                      value={ratings.teaching_aids}
                      onChange={(value) => setRatings({ ...ratings, teaching_aids: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Feedback (Mandatory)</Label>
                    <Textarea
                      placeholder="Share any specific comments or suggestions for improvement..."
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
                      <><Send className="mr-2 h-4 w-4" /> Submit Rating</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Rating History */}
          <Card className="p-6 card-elegant">
            <h2 className="text-2xl font-bold mb-2 gradient-text flex items-center gap-2">
              <History className="h-6 w-6" />
              Rating History
            </h2>
            <p className="text-muted-foreground mb-4">Your previously submitted ratings</p>
            {ratingHistory.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {ratingHistory.map((rating) => {
                    const avgRating = (
                      rating.engagement_level +
                      rating.concept_understanding +
                      rating.content_depth +
                      rating.application_teaching +
                      rating.pedagogy_tools +
                      rating.communication_skills +
                      rating.class_decorum +
                      rating.teaching_aids
                    ) / 8;
                    
                    return (
                      <div key={rating.id} className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{rating.faculty?.name}</p>
                            <p className="text-sm text-muted-foreground">{rating.faculty_assignments?.subject}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{avgRating.toFixed(1)}/5</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {rating.feedback_message && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{rating.feedback_message}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground py-8">No ratings submitted yet</p>
            )}
          </Card>

          {/* Messages from Admin */}
          {messages.length > 0 && (
            <Card className="p-6 card-elegant">
              <h2 className="text-2xl font-bold mb-2 gradient-text flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Messages from Admin
              </h2>
              <p className="text-muted-foreground mb-4">Important messages from the administration</p>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 bg-muted/50 rounded-lg border">
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
