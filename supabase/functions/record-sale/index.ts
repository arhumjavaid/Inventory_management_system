// Edge Function: record-sale
// Handles sale transactions with inventory updates and validation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SaleRequest {
  product_id: string
  quantity: number
  unit_price?: number
  customer_name?: string
  payment_method?: string
  notes?: string
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
    const saleData: SaleRequest = await req.json()

    // Validate required fields
    if (!saleData.product_id || !saleData.quantity || saleData.quantity <= 0) {
      throw new Error('Invalid sale data: product_id and positive quantity are required')
    }

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', saleData.product_id)
      .eq('status', 'active')
      .single()

    if (productError || !product) {
      throw new Error('Product not found or inactive')
    }

    // Check if product has sufficient quantity
    if (product.quantity < saleData.quantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.quantity}, Requested: ${saleData.quantity}`
      )
    }

    // Calculate sale details
    const unitPrice = saleData.unit_price || product.price
    const totalPrice = unitPrice * saleData.quantity

    // Start transaction: Create sale record
    const { data: sale, error: saleError } = await supabaseClient
      .from('sales')
      .insert({
        product_id: saleData.product_id,
        quantity: saleData.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        customer_name: saleData.customer_name,
        payment_method: saleData.payment_method || 'cash',
        notes: saleData.notes,
        sold_by: user.id,
      })
      .select()
      .single()

    if (saleError) {
      throw new Error(`Failed to create sale record: ${saleError.message}`)
    }

    // Update product quantity
    const newQuantity = product.quantity - saleData.quantity
    const { error: updateError } = await supabaseClient
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', saleData.product_id)

    if (updateError) {
      // Rollback sale if update fails
      await supabaseClient.from('sales').delete().eq('id', sale.id)
      throw new Error(`Failed to update inventory: ${updateError.message}`)
    }

    // Check if alert needs to be created for low stock
    if (newQuantity <= product.low_stock_threshold) {
      const alertMessage =
        newQuantity === 0
          ? `Product "${product.name}" (SKU: ${product.sku}) is out of stock`
          : `Product "${product.name}" (SKU: ${product.sku}) is running low. Current stock: ${newQuantity}`

      await supabaseClient.from('alerts').insert({
        type: 'low_stock',
        severity: newQuantity === 0 ? 'critical' : 'warning',
        message: alertMessage,
        product_id: saleData.product_id,
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          sale,
          new_stock_level: newQuantity,
        },
        message: 'Sale recorded successfully',
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
