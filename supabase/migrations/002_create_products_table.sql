-- Migration: 002_create_products_table
-- Description: Create products table with inventory tracking
-- Includes low stock threshold for automated alerts

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10, 2) CHECK (cost >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
  reorder_quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'unit',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_name ON public.products(name);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_quantity ON public.products(quantity);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_low_stock ON public.products(quantity, low_stock_threshold) 
  WHERE quantity <= low_stock_threshold;

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read products
CREATE POLICY "All authenticated users can view products"
ON public.products
FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policy: Only admins and managers can insert products
CREATE POLICY "Admins and managers can insert products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- RLS Policy: Only admins and managers can update products
CREATE POLICY "Admins and managers can update products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- RLS Policy: Only admins can delete products
CREATE POLICY "Only admins can delete products"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- View for low stock products
CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT 
  p.*,
  (p.low_stock_threshold - p.quantity) as units_needed
FROM public.products p
WHERE p.quantity <= p.low_stock_threshold
  AND p.status = 'active'
ORDER BY p.quantity ASC;

-- Comments
COMMENT ON TABLE public.products IS 'Product inventory with stock tracking';
COMMENT ON COLUMN public.products.sku IS 'Unique product SKU/barcode';
COMMENT ON COLUMN public.products.low_stock_threshold IS 'Alert when quantity drops below this value';
COMMENT ON COLUMN public.products.quantity IS 'Current stock quantity';
COMMENT ON VIEW public.low_stock_products IS 'Products that need reordering';
