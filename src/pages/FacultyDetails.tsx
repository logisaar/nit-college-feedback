import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Loader2, Users, BookOpen, TrendingUp, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FacultyData {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
}

interface RatingData {
  engagement_level: number;
  concept_understanding: number;
  content_depth: number;
  application_teaching: number;
  pedagogy_tools: number;
  communication_skills: number;
  class_decorum: number;
  teaching_aids: number;
  feedback_message: string;
  created_at: string;
  student_id: string;
  profiles?: {
    full_name: string;
    registration_number: string;
  };
}

export default function FacultyDetails() {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<FacultyData | null>(null);
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    loadFacultyDetails();
  }, [facultyId]);

  const loadFacultyDetails = async () => {
    try {
      // Load faculty info
      const { data: facultyData, error: facultyError } = await supabase
        .from("faculty")
        .select("*")
        .eq("id", facultyId)
        .single();

      if (facultyError) throw facultyError;
      setFaculty(facultyData);

      // Load ratings with student profile information
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("ratings")
        .select("*, profiles(full_name, registration_number)")
        .eq("faculty_id", facultyId);

      if (ratingsError) throw ratingsError;
      setRatings(ratingsData || []);

      // Load assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("faculty_assignments")
        .select("*")
        .eq("faculty_id", facultyId);

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

    } catch (error: any) {
      console.error("Error loading faculty details:", error);
      toast.error("Failed to load faculty details");
    } finally {
      setLoading(false);
    }
  };

  // Filter ratings by date range - must be before any conditional returns
  const filteredRatings = useMemo(() => {
    return ratings.filter(rating => {
      const ratingDate = new Date(rating.created_at);
      if (startDate && ratingDate < startDate) return false;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (ratingDate > endOfDay) return false;
      }
      return true;
    });
  }, [ratings, startDate, endDate]);

  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const averageRatings = filteredRatings.length > 0 ? {
    engagement_level: filteredRatings.reduce((sum, r) => sum + r.engagement_level, 0) / filteredRatings.length,
    concept_understanding: filteredRatings.reduce((sum, r) => sum + r.concept_understanding, 0) / filteredRatings.length,
    content_depth: filteredRatings.reduce((sum, r) => sum + r.content_depth, 0) / filteredRatings.length,
    application_teaching: filteredRatings.reduce((sum, r) => sum + r.application_teaching, 0) / filteredRatings.length,
    pedagogy_tools: filteredRatings.reduce((sum, r) => sum + r.pedagogy_tools, 0) / filteredRatings.length,
    communication_skills: filteredRatings.reduce((sum, r) => sum + r.communication_skills, 0) / filteredRatings.length,
    class_decorum: filteredRatings.reduce((sum, r) => sum + r.class_decorum, 0) / filteredRatings.length,
    teaching_aids: filteredRatings.reduce((sum, r) => sum + r.teaching_aids, 0) / filteredRatings.length,
  } : null;

  const overallRating = averageRatings 
    ? Object.values(averageRatings).reduce((sum, val) => sum + val, 0) / 8 
    : 0;

  const radarData = averageRatings ? [
    { subject: "Engagement", value: averageRatings.engagement_level },
    { subject: "Concept Understanding", value: averageRatings.concept_understanding },
    { subject: "Content Depth", value: averageRatings.content_depth },
    { subject: "Application Teaching", value: averageRatings.application_teaching },
    { subject: "Pedagogy Tools", value: averageRatings.pedagogy_tools },
    { subject: "Communication", value: averageRatings.communication_skills },
    { subject: "Class Decorum", value: averageRatings.class_decorum },
    { subject: "Teaching Aids", value: averageRatings.teaching_aids },
  ] : [];

  const criteriaData = averageRatings ? [
    { name: "Engagement", score: averageRatings.engagement_level },
    { name: "Concepts", score: averageRatings.concept_understanding },
    { name: "Content", score: averageRatings.content_depth },
    { name: "Application", score: averageRatings.application_teaching },
    { name: "Pedagogy", score: averageRatings.pedagogy_tools },
    { name: "Communication", score: averageRatings.communication_skills },
    { name: "Decorum", score: averageRatings.class_decorum },
    { name: "Teaching Aids", score: averageRatings.teaching_aids },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Faculty not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold gradient-text">{faculty.name}</h1>
            <p className="text-muted-foreground">{faculty.designation} - {faculty.department}</p>
          </div>

          {/* Date Filter */}
          <Card className="p-4 card-elegant mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filter by Date:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[150px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-muted-foreground">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[150px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {(startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={clearDateFilters}>
                  Clear Filters
                </Button>
              )}
              <span className="text-sm text-muted-foreground ml-auto">
                Showing {filteredRatings.length} of {ratings.length} ratings
              </span>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6 card-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Rating</p>
                  <p className="text-3xl font-bold">{overallRating.toFixed(1)}</p>
                  <p className={`text-xs mt-1 ${overallRating >= 4 ? "text-green-600" : overallRating >= 3 ? "text-yellow-600" : "text-red-600"}`}>
                    {overallRating >= 4 ? "Excellent Performance" : overallRating >= 3 ? "Good Performance" : "Needs Improvement"}
                  </p>
                </div>
                <Star className="h-10 w-10 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-6 card-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Ratings</p>
                  <p className="text-3xl font-bold">{filteredRatings.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Student evaluations</p>
                </div>
                <Users className="h-10 w-10 text-blue-500/20" />
              </div>
            </Card>

            <Card className="p-6 card-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subjects Taught</p>
                  <p className="text-3xl font-bold">{assignments.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Different subjects</p>
                </div>
                <BookOpen className="h-10 w-10 text-purple-500/20" />
              </div>
            </Card>

            <Card className="p-6 card-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Best Criteria</p>
                  <p className="text-lg font-bold">
                    {averageRatings ? 
                      Object.entries(averageRatings).sort((a, b) => b[1] - a[1])[0][0].replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()).slice(0, 12) + "..."
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {averageRatings ? `${Math.max(...Object.values(averageRatings)).toFixed(1)}/5.0` : ""}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500/20" />
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Radar Chart */}
            <Card className="p-6 card-elegant">
              <h3 className="text-lg font-semibold mb-4">Performance Radar</h3>
              <p className="text-sm text-muted-foreground mb-4">Detailed breakdown of all evaluation criteria</p>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} />
                    <Radar name="Rating" dataKey="value" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No ratings yet
                </div>
              )}
            </Card>

            {/* Bar Chart */}
            <Card className="p-6 card-elegant">
              <h3 className="text-lg font-semibold mb-4">Criteria Breakdown</h3>
              <p className="text-sm text-muted-foreground mb-4">Average scores across all evaluation criteria</p>
              {criteriaData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={criteriaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(250, 72%, 55%)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No ratings yet
                </div>
              )}
            </Card>
          </div>

          {/* Recent Feedback */}
          <Card className="p-6 card-elegant">
            <h3 className="text-lg font-semibold mb-4">Student Feedback</h3>
            <p className="text-sm text-muted-foreground mb-4">Comments and feedback from students{(startDate || endDate) ? " (filtered by date)" : ""}</p>
            {filteredRatings.filter(r => r.feedback_message).length > 0 ? (
              <div className="space-y-4">
                {filteredRatings.filter(r => r.feedback_message).map((rating, idx) => (
                  <div key={idx} className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary/20">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-primary">
                          {rating.profiles?.full_name || "Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reg. No: {rating.profiles?.registration_number || "N/A"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm mt-2">{rating.feedback_message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No feedback available</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
