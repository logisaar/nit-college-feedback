import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the request is from an authenticated admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("User is not an admin");
    }

    // Students data to import from Excel
    const students = [
      {
        email: "satyammallik@123gmail.com",
        password: "satyam",
        full_name: "satyam mallik",
        registration_number: "12345678",
        year: 2,
        semester: 3,
        section: "C",
        phone_number: "12345678",
        branch: "CSE"
      },
      {
        email: "subhamkumarshau@gmail.com",
        password: "subham",
        full_name: "subham kumar shau",
        registration_number: "1234467",
        year: 2,
        semester: 3,
        section: "E",
        phone_number: "123678966",
        branch: "CSE"
      },
      {
        email: "raghabbarik@gmail.com",
        password: "raghab",
        full_name: "raghab barik",
        registration_number: "12334567",
        year: 2,
        semester: 3,
        section: "C",
        phone_number: "1234567",
        branch: "CSE"
      }
    ];

    console.log(`Starting import of ${students.length} students...`);

    const results = [];
    const errors = [];

    for (const student of students) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          password: student.password,
          email_confirm: true,
        });

        if (authError) {
          errors.push({ email: student.email, error: authError.message });
          continue;
        }

        if (!authData.user) {
          errors.push({ email: student.email, error: "User creation failed" });
          continue;
        }

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: authData.user.id,
            full_name: student.full_name,
            registration_number: student.registration_number,
            branch: student.branch,
            year: student.year,
            semester: student.semester,
            section: student.section,
            phone_number: student.phone_number,
          });

        if (profileError) {
          errors.push({ email: student.email, error: profileError.message });
          continue;
        }

        results.push({ email: student.email, success: true });
      } catch (error: any) {
        errors.push({ email: student.email, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported: results.length,
        failed: errors.length,
        results,
        errors,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
