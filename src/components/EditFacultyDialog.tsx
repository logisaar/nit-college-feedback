import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  facultyId: string;
  facultyData: {
    name: string;
    email: string;
    department: string;
    designation: string;
  };
}

export function EditFacultyDialog({ open, onOpenChange, onSuccess, facultyId, facultyData }: EditFacultyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    semester: "",
    section: "",
    subject: "",
    year: "",
    branch: ""
  });

  useEffect(() => {
    const loadFacultyData = async () => {
      if (facultyData && facultyId) {
        // Load faculty assignment data
        const { data: assignmentData, error } = await supabase
          .from("faculty_assignments")
          .select("*")
          .eq("faculty_id", facultyId)
          .single();

        if (error) {
          console.error("Error loading assignment:", error);
        } else if (assignmentData) {
          setAssignmentId(assignmentData.id);
          setFormData({
            name: facultyData.name,
            email: facultyData.email,
            department: facultyData.department,
            designation: facultyData.designation,
            branch: assignmentData.branch,
            year: assignmentData.year.toString(),
            semester: assignmentData.semester.toString(),
            section: assignmentData.section,
            subject: assignmentData.subject
          });
        }
      }
    };

    loadFacultyData();
  }, [facultyData, facultyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.department || !formData.designation ||
        !formData.semester || !formData.section || !formData.subject || !formData.year || !formData.branch) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Update faculty details
      const { error: facultyError } = await supabase
        .from("faculty")
        .update({
          name: formData.name,
          email: formData.email,
          department: formData.department,
          designation: formData.designation
        })
        .eq("id", facultyId);

      if (facultyError) throw facultyError;

      // Update faculty assignment
      if (assignmentId) {
        const { error: assignmentError } = await supabase
          .from("faculty_assignments")
          .update({
            subject: formData.subject,
            year: parseInt(formData.year),
            semester: parseInt(formData.semester),
            section: formData.section,
            branch: formData.branch
          })
          .eq("id", assignmentId);

        if (assignmentError) throw assignmentError;
      }

      toast.success("Faculty updated successfully!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating faculty:", error);
      toast.error(error.message || "Failed to update faculty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Faculty</DialogTitle>
          <DialogDescription>
            Update faculty member information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Faculty Name *</Label>
            <Input
              id="name"
              placeholder="Enter faculty name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              placeholder="Enter department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Position *</Label>
            <Input
              id="designation"
              placeholder="Enter position (e.g., Professor, Assistant Professor)"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch *</Label>
            <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSE">CSE</SelectItem>
                <SelectItem value="CST">CST</SelectItem>
                <SelectItem value="ME">ME</SelectItem>
                <SelectItem value="EE">EE</SelectItem>
                <SelectItem value="CE">CE</SelectItem>
                <SelectItem value="MCA">MCA</SelectItem>
                <SelectItem value="MBA">MBA</SelectItem>
                <SelectItem value="BBA">BBA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Assigned Semester *</Label>
            <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Semester 3</SelectItem>
                <SelectItem value="4">Semester 4</SelectItem>
                <SelectItem value="5">Semester 5</SelectItem>
                <SelectItem value="6">Semester 6</SelectItem>
                <SelectItem value="7">Semester 7</SelectItem>
                <SelectItem value="8">Semester 8</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Assigned Section *</Label>
            <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((sec) => (
                  <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assigned Subject *</Label>
            <Input
              id="subject"
              placeholder="Enter subject name"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Faculty"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
