-- Fix alert type enum casting issue
-- This fixes the "column type is of type alert_type but expression is of type text" error

-- Drop and recreate the function with proper type casting
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
        -- Explicitly cast to alert_type enum
        (CASE WHEN NEW.quantity = 0 THEN 'out_of_stock' ELSE 'low_stock' END)::alert_type,
        'active'::alert_status,
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
        type = (CASE WHEN NEW.quantity = 0 THEN 'out_of_stock' ELSE 'low_stock' END)::alert_type,
        updated_at = NOW()
      WHERE id = existing_alert;
    END IF;
  ELSE
    -- If stock is back above threshold, resolve any active alerts
    UPDATE public.alerts
    SET 
      status = 'resolved'::alert_status,
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE product_id = NEW.id 
      AND type IN ('low_stock', 'out_of_stock')
      AND status = 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
