-- Migration: 006_create_reports_and_views
-- Description: Create views and functions for reporting and analytics
-- Provides optimized queries for business intelligence

-- View: Daily sales report
CREATE OR REPLACE VIEW public.daily_sales_report AS
SELECT 
  DATE(sold_at) as sale_date,
  COUNT(*) as total_transactions,
  SUM(quantity) as total_units_sold,
  SUM(total_price) as total_revenue,
  AVG(total_price) as average_transaction_value,
  COUNT(DISTINCT product_id) as unique_products_sold,
  COUNT(DISTINCT sold_by) as staff_involved
FROM public.sales
GROUP BY DATE(sold_at)
ORDER BY sale_date DESC;

-- View: Product performance report
CREATE OR REPLACE VIEW public.product_performance AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.category,
  p.price,
  p.cost,
  p.quantity as current_stock,
  p.low_stock_threshold,
  COALESCE(sales_data.total_sold, 0) as total_sold,
  COALESCE(sales_data.revenue, 0) as total_revenue,
  COALESCE(sales_data.revenue - (sales_data.total_sold * p.cost), 0) as profit,
  COALESCE(sales_data.transaction_count, 0) as transaction_count,
  COALESCE(purchases_data.total_purchased, 0) as total_purchased,
  COALESCE(purchases_data.total_cost, 0) as total_purchase_cost,
  p.created_at
FROM public.products p
LEFT JOIN (
  SELECT 
    product_id,
    SUM(quantity) as total_sold,
    SUM(total_price) as revenue,
    COUNT(*) as transaction_count
  FROM public.sales
  GROUP BY product_id
) sales_data ON p.id = sales_data.product_id
LEFT JOIN (
  SELECT 
    product_id,
    SUM(quantity) as total_purchased,
    SUM(total_cost) as total_cost
  FROM public.purchases
  WHERE status = 'completed'
  GROUP BY product_id
) purchases_data ON p.id = purchases_data.product_id
ORDER BY total_revenue DESC;

-- View: Monthly sales summary
CREATE OR REPLACE VIEW public.monthly_sales_summary AS
SELECT 
  DATE_TRUNC('month', sold_at) as month,
  COUNT(*) as total_transactions,
  SUM(quantity) as total_units,
  SUM(total_price) as total_revenue,
  COUNT(DISTINCT product_id) as unique_products,
  COUNT(DISTINCT sold_by) as active_staff
FROM public.sales
GROUP BY DATE_TRUNC('month', sold_at)
ORDER BY month DESC;

-- View: Category sales analysis
CREATE OR REPLACE VIEW public.category_sales_analysis AS
SELECT 
  p.category,
  COUNT(DISTINCT p.id) as product_count,
  SUM(s.quantity) as total_units_sold,
  SUM(s.total_price) as total_revenue,
  AVG(s.total_price) as avg_transaction_value,
  SUM(p.quantity) as current_stock
FROM public.products p
LEFT JOIN public.sales s ON p.id = s.product_id
GROUP BY p.category
ORDER BY total_revenue DESC NULLS LAST;

-- View: Top selling products
CREATE OR REPLACE VIEW public.top_selling_products AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.category,
  p.price,
  COUNT(s.id) as transaction_count,
  SUM(s.quantity) as total_sold,
  SUM(s.total_price) as total_revenue,
  p.quantity as current_stock
FROM public.products p
JOIN public.sales s ON p.id = s.product_id
GROUP BY p.id, p.name, p.sku, p.category, p.price, p.quantity
ORDER BY total_revenue DESC
LIMIT 50;

-- View: Inventory value report
CREATE OR REPLACE VIEW public.inventory_value_report AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.category,
  p.quantity,
  p.cost,
  p.price,
  (p.quantity * p.cost) as inventory_cost_value,
  (p.quantity * p.price) as inventory_retail_value,
  (p.quantity * (p.price - p.cost)) as potential_profit,
  p.status
FROM public.products p
WHERE p.status = 'active'
ORDER BY inventory_retail_value DESC;

-- View: User activity summary
CREATE OR REPLACE VIEW public.user_activity_summary AS
SELECT 
  up.id,
  up.full_name,
  up.email,
  up.role,
  sales_data.sales_count,
  sales_data.sales_revenue,
  purchases_data.purchases_count,
  purchases_data.purchases_total
FROM public.user_profiles up
LEFT JOIN (
  SELECT 
    sold_by,
    COUNT(*) as sales_count,
    SUM(total_price) as sales_revenue
  FROM public.sales
  GROUP BY sold_by
) sales_data ON up.id = sales_data.sold_by
LEFT JOIN (
  SELECT 
    purchased_by,
    COUNT(*) as purchases_count,
    SUM(total_cost) as purchases_total
  FROM public.purchases
  WHERE status = 'completed'
  GROUP BY purchased_by
) purchases_data ON up.id = purchases_data.purchased_by
ORDER BY sales_revenue DESC NULLS LAST;

-- Function: Get sales report by date range
CREATE OR REPLACE FUNCTION public.get_sales_report(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  sku TEXT,
  category TEXT,
  quantity_sold BIGINT,
  total_revenue NUMERIC,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.category,
    SUM(s.quantity)::BIGINT,
    SUM(s.total_price)::NUMERIC,
    COUNT(s.id)::BIGINT
  FROM public.products p
  JOIN public.sales s ON p.id = s.product_id
  WHERE s.sold_at BETWEEN start_date AND end_date
    AND (category_filter IS NULL OR p.category = category_filter)
  GROUP BY p.id, p.name, p.sku, p.category
  ORDER BY SUM(s.total_price) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get inventory status
CREATE OR REPLACE FUNCTION public.get_inventory_status()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_products', COUNT(*),
    'active_products', COUNT(*) FILTER (WHERE status = 'active'),
    'low_stock_products', COUNT(*) FILTER (WHERE quantity <= low_stock_threshold AND status = 'active'),
    'out_of_stock_products', COUNT(*) FILTER (WHERE quantity = 0 AND status = 'active'),
    'total_inventory_value', SUM(quantity * cost) FILTER (WHERE status = 'active'),
    'total_retail_value', SUM(quantity * price) FILTER (WHERE status = 'active')
  ) INTO result
  FROM public.products;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get dashboard stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  days_back INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  start_date := NOW() - (days_back || ' days')::INTERVAL;
  
  SELECT json_build_object(
    'sales', json_build_object(
      'total_transactions', COUNT(*),
      'total_revenue', COALESCE(SUM(total_price), 0),
      'avg_transaction_value', COALESCE(AVG(total_price), 0)
    ),
    'inventory', (SELECT public.get_inventory_status()),
    'alerts', json_build_object(
      'total_alerts', (SELECT COUNT(*) FROM public.alerts WHERE status = 'active'),
      'critical_alerts', (SELECT COUNT(*) FROM public.alerts WHERE status = 'active' AND severity = 'critical')
    ),
    'period_days', days_back
  ) INTO result
  FROM public.sales
  WHERE sold_at >= start_date;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON VIEW public.daily_sales_report IS 'Daily aggregated sales statistics';
COMMENT ON VIEW public.product_performance IS 'Comprehensive product performance metrics';
COMMENT ON VIEW public.monthly_sales_summary IS 'Monthly sales trends';
COMMENT ON VIEW public.category_sales_analysis IS 'Sales analysis by product category';
COMMENT ON VIEW public.top_selling_products IS 'Best performing products by revenue';
COMMENT ON VIEW public.inventory_value_report IS 'Current inventory valuation';
COMMENT ON VIEW public.user_activity_summary IS 'Staff activity and performance metrics';
COMMENT ON FUNCTION public.get_sales_report IS 'Generate sales report for date range with optional category filter';
COMMENT ON FUNCTION public.get_inventory_status IS 'Get current inventory status summary';
COMMENT ON FUNCTION public.get_dashboard_stats IS 'Get dashboard statistics for specified period';
