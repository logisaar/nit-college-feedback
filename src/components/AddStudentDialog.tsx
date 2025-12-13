import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Eye, EyeOff } from "lucide-react";
import * as XLSX from 'xlsx';

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddStudentDialog({ open, onOpenChange, onSuccess }: AddStudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"manual" | "file">("manual");
  const [isDragging, setIsDragging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    registrationNumber: "",
    branch: "",
    year: "",
    semester: "",
    section: "",
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name: formData.fullName,
          registration_number: formData.registrationNumber,
          branch: formData.branch,
          year: parseInt(formData.year),
          semester: parseInt(formData.semester),
          section: formData.section,
          phone_number: formData.phoneNumber,
        });

      if (profileError) throw profileError;

      toast.success("Student added successfully");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        registrationNumber: "",
        branch: "",
        year: "",
        semester: "",
        section: "",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (file: File) => {
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("No data found in the file");
        setLoading(false);
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Log available columns for debugging
      if (jsonData.length > 0) {
        console.log("Excel columns found:", Object.keys(jsonData[0]));
      }

      // Process each row
      for (const row of jsonData) {
        try {
          const rowData = row as any;
          
          // Create flexible field lookup that checks partial matches
          const getField = (fieldNames: string[]) => {
            const keys = Object.keys(rowData);
            
            // First try exact match (case-insensitive)
            for (const key of keys) {
              const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '').replace(/_/g, '');
              for (const fieldName of fieldNames) {
                const normalizedField = fieldName.toLowerCase().trim().replace(/\s+/g, '').replace(/_/g, '');
                if (normalizedKey === normalizedField) {
                  return rowData[key];
                }
              }
            }
            
            // Then try partial match (contains)
            for (const key of keys) {
              const normalizedKey = key.toLowerCase().trim();
              for (const fieldName of fieldNames) {
                const normalizedField = fieldName.toLowerCase().trim();
                if (normalizedKey.includes(normalizedField) || normalizedField.includes(normalizedKey)) {
                  return rowData[key];
                }
              }
            }
            
            return null;
          };

          const email = getField(['email', 'mail', 'e-mail', 'emailid']);
          const password = getField(['password', 'pass', 'pwd']);
          const fullName = getField(['fullname', 'full_name', 'name', 'studentname', 'student', 'fullname']);
          const registrationNumber = getField(['registration', 'regno', 'reg', 'registrationnumber', 'regnumber', 'regstitionno', 'regstitionno.']);
          const branch = getField(['branch', 'department', 'dept', 'stream']) || 'CSE'; // Default branch if missing
          const yearRaw = getField(['year', 'yr', 'class']);
          const semesterRaw = getField(['semester', 'sem', 'semestar']);
          const section = getField(['section', 'sec', 'div']);
          const phoneNumber = getField(['phone', 'mobile', 'contact', 'phonenumber', 'mobilenumber', 'phoneno', 'phoneno.']);
          
          // Parse year from text like "2nd" -> 2
          const year = yearRaw ? parseInt(String(yearRaw).replace(/\D/g, '')) : null;
          
          // Parse semester from text like "3rd" -> 3
          const semester = semesterRaw ? parseInt(String(semesterRaw).replace(/\D/g, '')) : null;
          
          if (!email || !password) {
            failedCount++;
            errors.push(`Row ${failedCount + successCount}: Missing email or password (found: ${email ? 'email' : 'no email'}, ${password ? 'password' : 'no password'})`);
            continue;
          }

          if (!fullName || !registrationNumber || !year || !semester || !section) {
            failedCount++;
            errors.push(`Row ${failedCount + successCount}: Missing required fields (found: name=${!!fullName}, reg=${!!registrationNumber}, year=${!!year}, sem=${!!semester}, section=${!!section})`);
            continue;
          }

          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: String(email).trim(),
            password: String(password),
          });

          if (authError) {
            failedCount++;
            errors.push(`${email}: ${authError.message}`);
            continue;
          }

          if (!authData.user) {
            failedCount++;
            errors.push(`${email}: User creation failed`);
            continue;
          }

          // Create profile
          const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            full_name: String(fullName).trim(),
            registration_number: String(registrationNumber).trim(),
            branch: String(branch).trim(),
            year: year,
            semester: semester,
            section: String(section).trim().toUpperCase(),
            phone_number: phoneNumber ? String(phoneNumber).trim() : null,
          });

          if (profileError) {
            failedCount++;
            errors.push(`${email}: ${profileError.message}`);
            continue;
          }

          successCount++;
        } catch (error: any) {
          failedCount++;
          errors.push(`Row error: ${error.message}`);
        }
      }

      // Show detailed feedback
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} student(s)`);
      }
      
      if (failedCount > 0) {
        toast.error(`Failed to add ${failedCount} student(s). Check console for details.`);
        console.error("Import errors:", errors);
      }

      if (successCount > 0) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to import students");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }
    
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    await processFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={uploadMode === "manual" ? "default" : "outline"}
            onClick={() => setUploadMode("manual")}
            className="flex-1"
          >
            Manual Entry
          </Button>
          <Button
            variant={uploadMode === "file" ? "default" : "outline"}
            onClick={() => setUploadMode("file")}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>

        {uploadMode === "manual" ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="Search registration number..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
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
                <Label htmlFor="year">Year</Label>
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
                <Label htmlFor="semester">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((sec) => (
                      <SelectItem key={sec} value={sec}>
                        Section {sec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-primary font-medium mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-muted-foreground">
                CSV or Excel file (xlsx, xls)
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Required columns: email, password, full_name, registration_number, year, semester, section, phone_number
                <br />
                <strong>Note:</strong> If branch is missing, it will default to CSE. Year and semester can be text (e.g., "2nd", "3rd").
              </p>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={loading}
              />
            </div>
            {loading && (
              <p className="text-center text-sm text-muted-foreground">
                Processing file...
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
