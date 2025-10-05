// Edge Function: manage-user
// Admin function to manage user roles and profiles

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserManagementRequest {
  action: 'create' | 'update' | 'delete' | 'update_role' | 'deactivate'
  user_id?: string
  email?: string
  password?: string
  full_name?: string
  phone_number?: string
  role?: 'admin' | 'manager' | 'staff'
  is_active?: boolean
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify requesting user is admin
    const {
      data: { user: requestingUser },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !requestingUser) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: requestingProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('role')
      .eq('id', requestingUser.id)
      .single()

    if (profileError || requestingProfile?.role !== 'admin') {
      throw new Error('Only administrators can manage users')
    }

    // Parse request body
    const requestData: UserManagementRequest = await req.json()

    let result

    switch (requestData.action) {
      case 'create': {
        // Create new user
        if (!requestData.email || !requestData.password || !requestData.full_name || !requestData.role) {
          throw new Error('Email, password, full name, and role are required for user creation')
        }

        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email: requestData.email,
          password: requestData.password,
          email_confirm: true,
          user_metadata: {
            full_name: requestData.full_name,
          },
        })

        if (createError) throw createError

        // Create user profile
        const { data: profile, error: profileCreateError } = await supabaseClient
          .from('user_profiles')
          .insert({
            id: newUser.user.id,
            email: requestData.email,
            full_name: requestData.full_name,
            phone_number: requestData.phone_number,
            role: requestData.role,
            is_active: true,
          })
          .select()
          .single()

        if (profileCreateError) throw profileCreateError

        result = {
          user: newUser.user,
          profile,
        }
        break
      }

      case 'update': {
        // Update user profile
        if (!requestData.user_id) {
          throw new Error('User ID is required for update')
        }

        const updateData: any = {}
        if (requestData.full_name) updateData.full_name = requestData.full_name
        if (requestData.phone_number) updateData.phone_number = requestData.phone_number
        if (requestData.is_active !== undefined) updateData.is_active = requestData.is_active

        const { data: profile, error: updateError } = await supabaseClient
          .from('user_profiles')
          .update(updateData)
          .eq('id', requestData.user_id)
          .select()
          .single()

        if (updateError) throw updateError

        // If email needs to be updated
        if (requestData.email) {
          const { error: emailError } = await supabaseClient.auth.admin.updateUserById(
            requestData.user_id,
            { email: requestData.email }
          )
          if (emailError) throw emailError
        }

        // If password needs to be updated
        if (requestData.password) {
          const { error: passwordError } = await supabaseClient.auth.admin.updateUserById(
            requestData.user_id,
            { password: requestData.password }
          )
          if (passwordError) throw passwordError
        }

        result = { profile }
        break
      }

      case 'update_role': {
        // Update user role
        if (!requestData.user_id || !requestData.role) {
          throw new Error('User ID and role are required')
        }

        const { data: profile, error: roleError } = await supabaseClient
          .from('user_profiles')
          .update({ role: requestData.role })
          .eq('id', requestData.user_id)
          .select()
          .single()

        if (roleError) throw roleError

        result = { profile }
        break
      }

      case 'deactivate': {
        // Deactivate user
        if (!requestData.user_id) {
          throw new Error('User ID is required')
        }

        // Don't allow deactivating yourself
        if (requestData.user_id === requestingUser.id) {
          throw new Error('Cannot deactivate your own account')
        }

        const { data: profile, error: deactivateError } = await supabaseClient
          .from('user_profiles')
          .update({ is_active: false })
          .eq('id', requestData.user_id)
          .select()
          .single()

        if (deactivateError) throw deactivateError

        result = { profile }
        break
      }

      case 'delete': {
        // Delete user (soft delete by deactivating)
        if (!requestData.user_id) {
          throw new Error('User ID is required')
        }

        // Don't allow deleting yourself
        if (requestData.user_id === requestingUser.id) {
          throw new Error('Cannot delete your own account')
        }

        // Soft delete by setting is_active to false
        const { data: profile, error: deleteError } = await supabaseClient
          .from('user_profiles')
          .update({ is_active: false })
          .eq('id', requestData.user_id)
          .select()
          .single()

        if (deleteError) throw deleteError

        result = { profile, message: 'User deactivated successfully' }
        break
      }

      default:
        throw new Error(`Invalid action: ${requestData.action}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: `User ${requestData.action} completed successfully`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
