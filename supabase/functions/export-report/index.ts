// Edge Function: export-report
// Exports reports to PDF, Excel, or CSV formats

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  reportType: 'sales' | 'stock' | 'purchase' | 'profit'
  format: 'pdf' | 'excel' | 'csv'
  startDate: string
  endDate: string
  categoryFilter?: string
  data: any[]
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
    const exportRequest: ExportRequest = await req.json()
    const { reportType, format, startDate, endDate, categoryFilter, data } = exportRequest

    let content: string
    let contentType: string
    let filename: string

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    filename = `${reportType}_report_${timestamp}.${format}`

    switch (format) {
      case 'csv': {
        // Generate CSV content
        const columns = getColumnsForReportType(reportType)
        const headers = columns.map(col => col.label).join(',')
        
        const rows = data.map(item => {
          return columns.map(col => {
            const value = item[col.key]
            // Handle values that might contain commas
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`
            }
            return value ?? ''
          }).join(',')
        }).join('\n')

        content = `${headers}\n${rows}`
        contentType = 'text/csv'
        break
      }

      case 'excel': {
        // Generate Excel content (using HTML table format that Excel can open)
        const columns = getColumnsForReportType(reportType)
        
        let html = `
          <html xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head>
              <meta charset="UTF-8">
              <style>
                table { border-collapse: collapse; width: 100%; }
                th { background-color: #4F46E5; color: white; padding: 10px; text-align: left; font-weight: bold; }
                td { padding: 8px; border: 1px solid #ddd; }
                tr:nth-child(even) { background-color: #f9fafb; }
              </style>
            </head>
            <body>
              <h2>${getReportTitle(reportType)}</h2>
              <p>Period: ${startDate} to ${endDate}</p>
              ${categoryFilter && categoryFilter !== 'All' ? `<p>Category: ${categoryFilter}</p>` : ''}
              <p>Generated: ${new Date().toLocaleString()}</p>
              <br/>
              <table>
                <thead>
                  <tr>
                    ${columns.map(col => `<th>${col.label}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${data.map(item => `
                    <tr>
                      ${columns.map(col => `<td>${formatCellValue(item[col.key], col.key)}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              ${reportType === 'sales' || reportType === 'profit' ? generateSummaryFooter(data) : ''}
            </body>
          </html>
        `

        content = html
        contentType = 'application/vnd.ms-excel'
        filename = filename.replace('.excel', '.xls')
        break
      }

      case 'pdf': {
        // For PDF, we'll return HTML that can be converted to PDF on the client side
        // Or use a PDF generation library
        const columns = getColumnsForReportType(reportType)
        
        let html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #1F2937; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; }
                .metadata { color: #6B7280; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #4F46E5; color: white; padding: 12px; text-align: left; }
                td { padding: 10px; border: 1px solid #E5E7EB; }
                tr:nth-child(even) { background-color: #F9FAFB; }
                .footer { margin-top: 30px; padding: 20px; background-color: #F3F4F6; border-radius: 8px; }
                .footer-item { display: inline-block; margin-right: 40px; }
                .footer-label { color: #6B7280; font-size: 14px; }
                .footer-value { font-size: 24px; font-weight: bold; color: #1F2937; }
              </style>
            </head>
            <body>
              <h1>${getReportTitle(reportType)}</h1>
              <div class="metadata">
                <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
                ${categoryFilter && categoryFilter !== 'All' ? `<p><strong>Category:</strong> ${categoryFilter}</p>` : ''}
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Generated by:</strong> ${user.email}</p>
              </div>
              
              <table>
                <thead>
                  <tr>
                    ${columns.map(col => `<th>${col.label}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${data.map(item => `
                    <tr>
                      ${columns.map(col => `<td>${formatCellValue(item[col.key], col.key)}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              ${(reportType === 'sales' || reportType === 'profit') ? generateSummaryFooter(data) : ''}
              
              <div style="margin-top: 40px; color: #9CA3AF; font-size: 12px; text-align: center;">
                <p>Inventory Management System - Report Generated on ${new Date().toLocaleDateString()}</p>
              </div>
            </body>
          </html>
        `

        content = html
        contentType = 'text/html'
        break
      }

      default:
        throw new Error(`Invalid format: ${format}`)
    }

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
      status: 200,
    })
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

// Helper functions
function getColumnsForReportType(reportType: string) {
  switch (reportType) {
    case 'sales':
      return [
        { key: 'product', label: 'Product' },
        { key: 'category', label: 'Category' },
        { key: 'unitsSold', label: 'Units Sold' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'profit', label: 'Profit' },
      ]
    case 'stock':
      return [
        { key: 'sku', label: 'SKU' },
        { key: 'product', label: 'Product' },
        { key: 'category', label: 'Category' },
        { key: 'currentStock', label: 'Current Stock' },
        { key: 'reorderLevel', label: 'Reorder Level' },
        { key: 'status', label: 'Status' },
      ]
    case 'purchase':
      return [
        { key: 'product', label: 'Product' },
        { key: 'category', label: 'Category' },
        { key: 'totalQuantity', label: 'Total Quantity' },
        { key: 'orderCount', label: 'Orders' },
        { key: 'totalCost', label: 'Total Cost' },
      ]
    case 'profit':
      return [
        { key: 'product', label: 'Product' },
        { key: 'category', label: 'Category' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'cost', label: 'Cost' },
        { key: 'profit', label: 'Profit' },
        { key: 'margin', label: 'Margin %' },
      ]
    default:
      return []
  }
}

function getReportTitle(reportType: string): string {
  switch (reportType) {
    case 'sales':
      return 'Sales Report'
    case 'stock':
      return 'Stock Inventory Report'
    case 'purchase':
      return 'Purchase Report'
    case 'profit':
      return 'Profit Analysis Report'
    default:
      return 'Report'
  }
}

function formatCellValue(value: any, key: string): string {
  if (value === null || value === undefined) {
    return '-'
  }

  // Format currency values
  if (key === 'revenue' || key === 'profit' || key === 'cost' || key === 'totalCost') {
    const numValue = typeof value === 'number' ? value : parseFloat(value)
    return `$${numValue.toFixed(2)}`
  }

  // Format margin percentage
  if (key === 'margin') {
    const numValue = typeof value === 'number' ? value : parseFloat(value)
    return `${numValue.toFixed(1)}%`
  }

  return String(value)
}

function generateSummaryFooter(data: any[]): string {
  const totalUnits = data.reduce((sum, item) => sum + (item.unitsSold || 0), 0)
  const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0)
  const totalProfit = data.reduce((sum, item) => sum + (item.profit || 0), 0)

  return `
    <div class="footer">
      <div class="footer-item">
        <div class="footer-label">Total Units</div>
        <div class="footer-value">${totalUnits}</div>
      </div>
      <div class="footer-item">
        <div class="footer-label">Total Revenue</div>
        <div class="footer-value">$${totalRevenue.toFixed(2)}</div>
      </div>
      <div class="footer-item">
        <div class="footer-label">Total Profit</div>
        <div class="footer-value">$${totalProfit.toFixed(2)}</div>
      </div>
    </div>
  `
}
