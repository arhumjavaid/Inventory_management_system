-- Migration: 004_create_purchases_table
-- Description: Create purchase orders table
-- Tracks inventory restocking with supplier information

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost DECIMAL(10, 2) NOT NULL CHECK (unit_cost >= 0),
  total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  supplier_name TEXT NOT NULL,
  supplier_email TEXT,
  supplier_phone TEXT,
  purchase_order_number TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  purchased_by UUID NOT NULL REFERENCES public.user_profiles(id),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_purchases_product_id ON public.purchases(product_id);
CREATE INDEX idx_purchases_purchased_by ON public.purchases(purchased_by);
CREATE INDEX idx_purchases_purchased_at ON public.purchases(purchased_at DESC);
CREATE INDEX idx_purchases_supplier ON public.purchases(supplier_name);
CREATE INDEX idx_purchases_status ON public.purchases(status);

-- Enable Row Level Security
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view purchases
CREATE POLICY "All authenticated users can view purchases"
ON public.purchases
FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policy: Authenticated users can insert purchases
CREATE POLICY "Authenticated users can insert purchases"
ON public.purchases
FOR INSERT
WITH CHECK (
  auth.uid() = purchased_by AND
  auth.role() = 'authenticated'
);

-- RLS Policy: Admins and managers can update purchases
CREATE POLICY "Admins and managers can update purchases"
ON public.purchases
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- RLS Policy: Only admins can delete purchases
CREATE POLICY "Only admins can delete purchases"
ON public.purchases
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to increase product quantity on purchase
CREATE OR REPLACE FUNCTION public.handle_purchase_stock_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stock if purchase is completed
  IF NEW.status = 'completed' THEN
    -- Increase product quantity
    UPDATE public.products
    SET quantity = quantity + NEW.quantity
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stock on purchase
CREATE TRIGGER on_purchase_increase_stock
  AFTER INSERT ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_purchase_stock_update();

-- Function to handle purchase status changes
CREATE OR REPLACE FUNCTION public.handle_purchase_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed from pending to completed, add stock
  IF OLD.status = 'pending' AND NEW.status = 'completed' THEN
    UPDATE public.products
    SET quantity = quantity + NEW.quantity
    WHERE id = NEW.product_id;
  END IF;

  -- If status changed from completed to cancelled, remove stock
  IF OLD.status = 'completed' AND NEW.status = 'cancelled' THEN
    UPDATE public.products
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle status changes
CREATE TRIGGER on_purchase_status_change
  AFTER UPDATE ON public.purchases
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_purchase_status_change();

-- Trigger to auto-update updated_at
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- View for purchases summary
CREATE OR REPLACE VIEW public.purchases_summary AS
SELECT 
  pur.id,
  pur.product_id,
  p.name as product_name,
  p.sku,
  p.category,
  pur.quantity,
  pur.unit_cost,
  pur.total_cost,
  pur.supplier_name,
  pur.purchase_order_number,
  pur.status,
  pur.purchased_by,
  up.full_name as purchased_by_name,
  pur.purchased_at,
  pur.created_at
FROM public.purchases pur
JOIN public.products p ON pur.product_id = p.id
JOIN public.user_profiles up ON pur.purchased_by = up.id
ORDER BY pur.purchased_at DESC;

-- Comments
COMMENT ON TABLE public.purchases IS 'Purchase orders with automatic stock updates';
COMMENT ON COLUMN public.purchases.status IS 'Purchase status: pending, completed, or cancelled';
COMMENT ON COLUMN public.purchases.total_cost IS 'Automatically calculated from quantity × unit_cost';
COMMENT ON VIEW public.purchases_summary IS 'Purchases with product and user details';
