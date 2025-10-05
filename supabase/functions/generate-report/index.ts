// Edge Function: generate-report
// Generates various reports (sales, inventory, performance)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportRequest {
  type: 'sales' | 'inventory' | 'product_performance' | 'category_analysis' | 'dashboard'
  start_date?: string
  end_date?: string
  category?: string
  days_back?: number
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const reportRequest: ReportRequest = await req.json()

    let reportData

    switch (reportRequest.type) {
      case 'sales': {
        // Generate sales report
        const startDate = reportRequest.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const endDate = reportRequest.end_date || new Date().toISOString()

        const { data, error } = await supabaseClient.rpc('get_sales_report', {
          start_date: startDate,
          end_date: endDate,
          category_filter: reportRequest.category || null,
        })

        if (error) throw error

        reportData = {
          type: 'sales',
          period: { start: startDate, end: endDate },
          category: reportRequest.category,
          data,
          generated_at: new Date().toISOString(),
        }
        break
      }

      case 'inventory': {
        // Get inventory value report
        const { data, error } = await supabaseClient
          .from('inventory_value_report')
          .select('*')

        if (error) throw error

        const { data: statusData, error: statusError } = await supabaseClient.rpc('get_inventory_status')

        if (statusError) throw statusError

        reportData = {
          type: 'inventory',
          summary: statusData,
          details: data,
          generated_at: new Date().toISOString(),
        }
        break
      }

      case 'product_performance': {
        // Get product performance report
        const { data, error } = await supabaseClient
          .from('product_performance')
          .select('*')
          .limit(100)

        if (error) throw error

        reportData = {
          type: 'product_performance',
          data,
          generated_at: new Date().toISOString(),
        }
        break
      }

      case 'category_analysis': {
        // Get category sales analysis
        const { data, error } = await supabaseClient
          .from('category_sales_analysis')
          .select('*')

        if (error) throw error

        reportData = {
          type: 'category_analysis',
          data,
          generated_at: new Date().toISOString(),
        }
        break
      }

      case 'dashboard': {
        // Get dashboard stats
        const daysBack = reportRequest.days_back || 30

        const { data, error } = await supabaseClient.rpc('get_dashboard_stats', {
          days_back: daysBack,
        })

        if (error) throw error

        // Get recent alerts
        const { data: alerts, error: alertsError } = await supabaseClient
          .from('alerts')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10)

        if (alertsError) throw alertsError

        // Get top selling products
        const { data: topProducts, error: topProductsError } = await supabaseClient
          .from('top_selling_products')
          .select('*')
          .limit(10)

        if (topProductsError) throw topProductsError

        reportData = {
          type: 'dashboard',
          stats: data,
          recent_alerts: alerts,
          top_products: topProducts,
          generated_at: new Date().toISOString(),
        }
        break
      }

      default:
        throw new Error(`Invalid report type: ${reportRequest.type}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
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
