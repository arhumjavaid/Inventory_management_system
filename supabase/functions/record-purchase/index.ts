// Edge Function: record-purchase
// Handles purchase orders with inventory updates

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PurchaseRequest {
  product_id: string
  quantity: number
  unit_cost?: number
  supplier_name: string
  payment_method?: string
  notes?: string
  expected_delivery?: string
  status?: 'pending' | 'ordered' | 'in_transit' | 'completed' | 'cancelled'
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
    const purchaseData: PurchaseRequest = await req.json()

    // Validate required fields
    if (!purchaseData.product_id || !purchaseData.quantity || purchaseData.quantity <= 0) {
      throw new Error('Invalid purchase data: product_id and positive quantity are required')
    }

    if (!purchaseData.supplier_name) {
      throw new Error('Supplier name is required')
    }

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', purchaseData.product_id)
      .single()

    if (productError || !product) {
      throw new Error('Product not found')
    }

    // Calculate purchase details
    const unitCost = purchaseData.unit_cost || product.cost
    const totalCost = unitCost * purchaseData.quantity

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('purchases')
      .insert({
        product_id: purchaseData.product_id,
        quantity: purchaseData.quantity,
        unit_cost: unitCost,
        total_cost: totalCost,
        supplier_name: purchaseData.supplier_name,
        payment_method: purchaseData.payment_method || 'credit',
        notes: purchaseData.notes,
        expected_delivery: purchaseData.expected_delivery,
        status: purchaseData.status || 'pending',
        purchased_by: user.id,
      })
      .select()
      .single()

    if (purchaseError) {
      throw new Error(`Failed to create purchase record: ${purchaseError.message}`)
    }

    // If purchase status is 'completed', update inventory
    if (purchaseData.status === 'completed') {
      const newQuantity = product.quantity + purchaseData.quantity
      const { error: updateError } = await supabaseClient
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', purchaseData.product_id)

      if (updateError) {
        // Rollback purchase if update fails
        await supabaseClient.from('purchases').delete().eq('id', purchase.id)
        throw new Error(`Failed to update inventory: ${updateError.message}`)
      }

      // Create alert for stock replenishment
      await supabaseClient.from('alerts').insert({
        type: 'restock',
        severity: 'info',
        message: `Product "${product.name}" (SKU: ${product.sku}) restocked. New stock level: ${newQuantity}`,
        product_id: purchaseData.product_id,
      })

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            purchase,
            new_stock_level: newQuantity,
          },
          message: 'Purchase recorded and inventory updated successfully',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          purchase,
        },
        message: `Purchase order created with status: ${purchase.status}`,
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
