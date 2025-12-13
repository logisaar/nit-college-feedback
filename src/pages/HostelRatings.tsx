import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Users, UserX, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HostelRatingWithStudent {
  id: string;
  student_id: string;
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
  feedback_message: string | null;
  created_at: string;
  student_name: string;
  registration_number: string;
}

interface StudentWithoutRating {
  id: string;
  full_name: string;
  registration_number: string;
  branch: string;
  section: string;
}

export default function HostelRatings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<HostelRatingWithStudent[]>([]);
  const [studentsWithoutRatings, setStudentsWithoutRatings] = useState<StudentWithoutRating[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin-login");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleData || roleData.role !== "admin") {
        toast.error("Access denied");
        navigate("/student-login");
        return;
      }

      await loadData();
    } catch (error) {
      navigate("/admin-login");
    }
  };

  const loadData = async () => {
    try {
      // Load all hostel ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("hostel_ratings")
        .select("*")
        .order("created_at", { ascending: false });

      if (ratingsError) throw ratingsError;

      // Load all students
      const { data: studentsData, error: studentsError } = await supabase
        .from("profiles")
        .select("id, full_name, registration_number, branch, section");

      if (studentsError) throw studentsError;

      // Match ratings with student info
      const ratingsWithStudents: HostelRatingWithStudent[] = (ratingsData || []).map(rating => {
        const student = studentsData?.find(s => s.id === rating.student_id);
        return {
          ...rating,
          student_name: student?.full_name || "Unknown",
          registration_number: student?.registration_number || "N/A",
        };
      });

      setRatings(ratingsWithStudents);

      // Find students without ratings
      const ratedStudentIds = new Set(ratingsData?.map(r => r.student_id) || []);
      const withoutRatings = (studentsData || []).filter(s => !ratedStudentIds.has(s.id));
      setStudentsWithoutRatings(withoutRatings);

      // Calculate average ratings
      if (ratingsData && ratingsData.length > 0) {
        const avgRatings: Record<string, number> = {
          accommodation_rooms: 0,
          washrooms_hygiene: 0,
          mess_food_quality: 0,
          safety_security: 0,
          hostel_staff_behaviour: 0,
          maintenance_facilities: 0,
          wifi_connectivity: 0,
          discipline_rules: 0,
          medical_facilities: 0,
          overall_living_experience: 0,
        };

        ratingsData.forEach(r => {
          avgRatings.accommodation_rooms += r.accommodation_rooms;
          avgRatings.washrooms_hygiene += r.washrooms_hygiene;
          avgRatings.mess_food_quality += r.mess_food_quality;
          avgRatings.safety_security += r.safety_security;
          avgRatings.hostel_staff_behaviour += r.hostel_staff_behaviour;
          avgRatings.maintenance_facilities += r.maintenance_facilities;
          avgRatings.wifi_connectivity += r.wifi_connectivity;
          avgRatings.discipline_rules += r.discipline_rules;
          avgRatings.medical_facilities += r.medical_facilities;
          avgRatings.overall_living_experience += r.overall_living_experience;
        });

        Object.keys(avgRatings).forEach(key => {
          avgRatings[key] = avgRatings[key] / ratingsData.length;
        });

        setAverageRatings(avgRatings);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load hostel ratings data");
    } finally {
      setLoading(false);
    }
  };

  const criteriaLabels: Record<string, string> = {
    accommodation_rooms: "Accommodation & Rooms",
    washrooms_hygiene: "Washrooms & Hygiene",
    mess_food_quality: "Mess & Food Quality",
    safety_security: "Safety & Security",
    hostel_staff_behaviour: "Hostel Staff Behaviour",
    maintenance_facilities: "Maintenance & Facilities",
    wifi_connectivity: "Wi-Fi & Connectivity",
    discipline_rules: "Discipline & Rules",
    medical_facilities: "Medical Facilities",
    overall_living_experience: "Overall Living Experience",
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
            <Star className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Hostel Ratings</h1>
              <p className="text-sm text-muted-foreground">View all hostel feedback</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Students Rated</p>
                  <p className="text-2xl font-bold">{ratings.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <UserX className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Not Rated Yet</p>
                  <p className="text-2xl font-bold">{studentsWithoutRatings.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Overall Average</p>
                  <p className="text-2xl font-bold">
                    {averageRatings.overall_living_experience?.toFixed(1) || "N/A"}/5
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Average Ratings by Criteria */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Average Ratings by Criteria</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(criteriaLabels).map(([key, label]) => (
                <div key={key} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold">
                      {averageRatings[key]?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Tabs defaultValue="ratings" className="w-full">
            <TabsList>
              <TabsTrigger value="ratings">
                <Users className="h-4 w-4 mr-2" />
                Students Who Rated ({ratings.length})
              </TabsTrigger>
              <TabsTrigger value="not-rated">
                <UserX className="h-4 w-4 mr-2" />
                Not Rated ({studentsWithoutRatings.length})
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ratings">
              <Card className="p-4">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Reg. No.</TableHead>
                        <TableHead>Accommodation</TableHead>
                        <TableHead>Washrooms</TableHead>
                        <TableHead>Food</TableHead>
                        <TableHead>Security</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Maintenance</TableHead>
                        <TableHead>Wi-Fi</TableHead>
                        <TableHead>Discipline</TableHead>
                        <TableHead>Medical</TableHead>
                        <TableHead>Overall</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ratings.map((rating) => (
                        <TableRow key={rating.id}>
                          <TableCell className="font-medium">{rating.student_name}</TableCell>
                          <TableCell>{rating.registration_number}</TableCell>
                          <TableCell>{rating.accommodation_rooms}</TableCell>
                          <TableCell>{rating.washrooms_hygiene}</TableCell>
                          <TableCell>{rating.mess_food_quality}</TableCell>
                          <TableCell>{rating.safety_security}</TableCell>
                          <TableCell>{rating.hostel_staff_behaviour}</TableCell>
                          <TableCell>{rating.maintenance_facilities}</TableCell>
                          <TableCell>{rating.wifi_connectivity}</TableCell>
                          <TableCell>{rating.discipline_rules}</TableCell>
                          <TableCell>{rating.medical_facilities}</TableCell>
                          <TableCell className="font-bold">{rating.overall_living_experience}</TableCell>
                        </TableRow>
                      ))}
                      {ratings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center text-muted-foreground">
                            No hostel ratings submitted yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="not-rated">
              <Card className="p-4">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Registration Number</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Section</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsWithoutRatings.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.full_name}</TableCell>
                          <TableCell>{student.registration_number}</TableCell>
                          <TableCell>{student.branch}</TableCell>
                          <TableCell>{student.section}</TableCell>
                        </TableRow>
                      ))}
                      {studentsWithoutRatings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            All students have submitted hostel ratings
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="p-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {ratings
                      .filter(r => r.feedback_message)
                      .map((rating) => (
                        <Card key={rating.id} className="p-4 bg-muted/30">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{rating.student_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Reg. No: {rating.registration_number}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm mt-2 bg-background p-3 rounded-md">
                            "{rating.feedback_message}"
                          </p>
                        </Card>
                      ))}
                    {ratings.filter(r => r.feedback_message).length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No feedback messages submitted yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
