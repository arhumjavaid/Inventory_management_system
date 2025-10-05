-- Migration: 003_create_sales_table
-- Description: Create sales transactions table
-- Tracks all product sales with user attribution

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  notes TEXT,
  sold_by UUID NOT NULL REFERENCES public.user_profiles(id),
  sold_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_sales_product_id ON public.sales(product_id);
CREATE INDEX idx_sales_sold_by ON public.sales(sold_by);
CREATE INDEX idx_sales_sold_at ON public.sales(sold_at DESC);
CREATE INDEX idx_sales_date_range ON public.sales(sold_at);

-- Enable Row Level Security
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view sales
CREATE POLICY "All authenticated users can view sales"
ON public.sales
FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policy: Authenticated users can insert sales
CREATE POLICY "Authenticated users can insert sales"
ON public.sales
FOR INSERT
WITH CHECK (
  auth.uid() = sold_by AND
  auth.role() = 'authenticated'
);

-- RLS Policy: Only admins can update sales
CREATE POLICY "Only admins can update sales"
ON public.sales
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policy: Only admins can delete sales
CREATE POLICY "Only admins can delete sales"
ON public.sales
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to decrease product quantity on sale
CREATE OR REPLACE FUNCTION public.handle_sale_stock_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if product has enough stock
  IF (SELECT quantity FROM public.products WHERE id = NEW.product_id) < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product. Available: %, Requested: %',
      (SELECT quantity FROM public.products WHERE id = NEW.product_id),
      NEW.quantity;
  END IF;

  -- Decrease product quantity
  UPDATE public.products
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stock on sale
CREATE TRIGGER on_sale_decrease_stock
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_stock_update();

-- View for sales summary
CREATE OR REPLACE VIEW public.sales_summary AS
SELECT 
  s.id,
  s.product_id,
  p.name as product_name,
  p.sku,
  p.category,
  s.quantity,
  s.unit_price,
  s.total_price,
  s.customer_name,
  s.sold_by,
  up.full_name as sold_by_name,
  s.sold_at,
  s.created_at
FROM public.sales s
JOIN public.products p ON s.product_id = p.id
JOIN public.user_profiles up ON s.sold_by = up.id
ORDER BY s.sold_at DESC;

-- Comments
COMMENT ON TABLE public.sales IS 'Sales transactions with automatic stock updates';
COMMENT ON COLUMN public.sales.total_price IS 'Automatically calculated from quantity × unit_price';
COMMENT ON VIEW public.sales_summary IS 'Sales with product and user details';
