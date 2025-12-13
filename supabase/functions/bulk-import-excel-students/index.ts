import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StudentData {
  email: string
  password: string
  full_name: string
  registration_number: string
  year: string
  semester: string
  section: string
  phone_number: string
  branch: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { students }: { students: StudentData[] } = await req.json()

    console.log(`Starting bulk import of ${students.length} students`)

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { email: string; error: string }[]
    }

    for (const student of students) {
      try {
        // Parse year and semester from text format (e.g., "2nd" -> 2, "3rd" -> 3)
        const year = parseInt(student.year.replace(/\D/g, '')) || 2
        const semester = parseInt(student.semester.replace(/\D/g, '')) || 3

        console.log(`Creating student: ${student.email}`)

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          password: student.password,
          email_confirm: true,
          user_metadata: {
            full_name: student.full_name
          }
        })

        if (authError) {
          console.error(`Auth error for ${student.email}:`, authError.message)
          results.failed++
          results.errors.push({ email: student.email, error: authError.message })
          continue
        }

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: student.full_name,
            registration_number: student.registration_number,
            year: year,
            semester: semester,
            section: student.section,
            branch: student.branch || 'CSE',
            phone_number: student.phone_number
          })

        if (profileError) {
          console.error(`Profile error for ${student.email}:`, profileError.message)
          results.failed++
          results.errors.push({ email: student.email, error: profileError.message })
          continue
        }

        results.success++
        console.log(`Successfully created student: ${student.email}`)
      } catch (error: any) {
        console.error(`Error processing ${student.email}:`, error.message)
        results.failed++
        results.errors.push({ email: student.email, error: error.message })
      }
    }

    console.log(`Bulk import completed. Success: ${results.success}, Failed: ${results.failed}`)

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Bulk import error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
