import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SendEmail() {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [faculty, setFaculty] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadFacultyInfo();
  }, [facultyId]);

  const loadFacultyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("faculty")
        .select("*")
        .eq("id", facultyId)
        .single();

      if (error) throw error;
      setFaculty(data);
    } catch (error: any) {
      console.error("Error loading faculty:", error);
      toast.error("Failed to load faculty information");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-faculty-report", {
        body: {
          facultyId,
          facultyEmail: faculty.email,
          facultyName: faculty.name,
          message: message.trim()
        }
      });

      if (error) throw error;

      toast.success("Performance report sent successfully!");
      navigate("/admin");
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error(error.message || "Failed to send email");
    } finally {
      setSending(false);
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
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 card-elegant">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold gradient-text">Send Performance Report</h1>
                <p className="text-muted-foreground">Send feedback to {faculty?.name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Recipient Email</Label>
                <p className="text-sm font-medium mt-1">{faculty?.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message & Suggestions</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message with performance feedback and suggestions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This message will be included in the performance report email sent to the faculty member.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSendEmail}
                  className="flex-1 btn-gradient"
                  size="lg"
                  disabled={sending}
                >
                  {sending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Mail className="mr-2 h-4 w-4" /> Send Report</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
