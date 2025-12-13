import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import nalandaLogo from "@/assets/nalanda-logo.png";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "registration_enabled")
        .single();

      if (error) throw error;
      setRegistrationEnabled(data?.setting_value === "true");
    } catch (error) {
      console.error("Error loading settings:", error);
      // Default to enabled if there's an error
      setRegistrationEnabled(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <img src={nalandaLogo} alt="Nalanda Institute of Technology" className="h-16 md:h-20" />
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="h-20 w-20 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            Faculty Feedback System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform for students to rate faculty performance and for administrators to analyze teaching quality
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="btn-gradient w-full sm:w-auto px-8"
            onClick={() => navigate("/student-login")}
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            Student Login
          </Button>
          {registrationEnabled && (
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto px-8"
              onClick={() => navigate("/student-register")}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Student Registration
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto px-8"
            onClick={() => navigate("/admin-login")}
          >
            <Shield className="mr-2 h-5 w-5" />
            Admin Access
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 text-center border-t border-border/40">
        <p className="text-sm text-muted-foreground">
          Designed and Developed by{" "}
          <a 
            href="https://logisaar.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Logisaar
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
