-- Migration: 005_create_alerts_table
-- Description: Create alerts table for notifications
-- Tracks low stock alerts and system notifications

CREATE TYPE alert_type AS ENUM ('low_stock', 'out_of_stock', 'reorder', 'system');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved');

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  type alert_type NOT NULL DEFAULT 'low_stock',
  status alert_status NOT NULL DEFAULT 'active',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  acknowledged_by UUID REFERENCES public.user_profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.user_profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_alerts_product_id ON public.alerts(product_id);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_type ON public.alerts(type);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX idx_alerts_active ON public.alerts(status) WHERE status = 'active';

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view alerts
CREATE POLICY "All authenticated users can view alerts"
ON public.alerts
FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policy: System can insert alerts (via triggers)
CREATE POLICY "System can insert alerts"
ON public.alerts
FOR INSERT
WITH CHECK (true);

-- RLS Policy: Authenticated users can update alert status
CREATE POLICY "Users can update alert status"
ON public.alerts
FOR UPDATE
USING (auth.role() = 'authenticated');

-- RLS Policy: Only admins can delete alerts
CREATE POLICY "Only admins can delete alerts"
ON public.alerts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to create low stock alert
CREATE OR REPLACE FUNCTION public.create_low_stock_alert()
RETURNS TRIGGER AS $$
DECLARE
  existing_alert UUID;
  alert_message TEXT;
  alert_severity TEXT;
BEGIN
  -- Check if product quantity is below threshold
  IF NEW.quantity <= NEW.low_stock_threshold AND NEW.status = 'active' THEN
    
    -- Determine severity
    IF NEW.quantity = 0 THEN
      alert_severity := 'critical';
      alert_message := format('Product "%s" (SKU: %s) is OUT OF STOCK!', NEW.name, NEW.sku);
    ELSIF NEW.quantity <= (NEW.low_stock_threshold / 2) THEN
      alert_severity := 'high';
      alert_message := format('Product "%s" (SKU: %s) is critically low. Current: %s, Threshold: %s', 
        NEW.name, NEW.sku, NEW.quantity, NEW.low_stock_threshold);
    ELSE
      alert_severity := 'medium';
      alert_message := format('Product "%s" (SKU: %s) is low on stock. Current: %s, Threshold: %s', 
        NEW.name, NEW.sku, NEW.quantity, NEW.low_stock_threshold);
    END IF;

    -- Check if there's already an active alert for this product
    SELECT id INTO existing_alert
    FROM public.alerts
    WHERE product_id = NEW.id 
      AND type IN ('low_stock', 'out_of_stock')
      AND status = 'active'
    LIMIT 1;

    -- If no active alert exists, create one
    IF existing_alert IS NULL THEN
      INSERT INTO public.alerts (
        product_id,
        type,
        status,
        title,
        message,
        severity
      ) VALUES (
        NEW.id,
        CASE WHEN NEW.quantity = 0 THEN 'out_of_stock' ELSE 'low_stock' END,
        'active',
        CASE WHEN NEW.quantity = 0 THEN 'Out of Stock Alert' ELSE 'Low Stock Alert' END,
        alert_message,
        alert_severity
      );
    ELSE
      -- Update existing alert with new message and severity
      UPDATE public.alerts
      SET 
        message = alert_message,
        severity = alert_severity,
        type = CASE WHEN NEW.quantity = 0 THEN 'out_of_stock' ELSE 'low_stock' END,
        updated_at = NOW()
      WHERE id = existing_alert;
    END IF;
  ELSE
    -- If stock is back above threshold, resolve any active alerts
    UPDATE public.alerts
    SET 
      status = 'resolved',
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE product_id = NEW.id 
      AND type IN ('low_stock', 'out_of_stock')
      AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create alerts on product quantity changes
CREATE TRIGGER on_product_quantity_change
  AFTER INSERT OR UPDATE OF quantity ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.create_low_stock_alert();

-- Trigger to auto-update updated_at
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- View for active alerts with product details
CREATE OR REPLACE VIEW public.active_alerts AS
SELECT 
  a.id,
  a.product_id,
  p.name as product_name,
  p.sku,
  p.quantity as current_stock,
  p.low_stock_threshold,
  a.type,
  a.status,
  a.title,
  a.message,
  a.severity,
  a.created_at,
  a.updated_at
FROM public.alerts a
LEFT JOIN public.products p ON a.product_id = p.id
WHERE a.status = 'active'
ORDER BY 
  CASE a.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  a.created_at DESC;

-- Comments
COMMENT ON TABLE public.alerts IS 'System alerts and notifications with automatic low stock detection';
COMMENT ON COLUMN public.alerts.type IS 'Alert type: low_stock, out_of_stock, reorder, or system';
COMMENT ON COLUMN public.alerts.status IS 'Alert status: active, acknowledged, or resolved';
COMMENT ON COLUMN public.alerts.severity IS 'Alert priority: low, medium, high, or critical';
COMMENT ON VIEW public.active_alerts IS 'Currently active alerts sorted by severity';
