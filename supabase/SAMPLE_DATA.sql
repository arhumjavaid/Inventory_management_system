-- =================================================================
-- SAMPLE DATA FOR SMARTSTOCK INVENTORY MANAGEMENT SYSTEM
-- =================================================================
-- Run this SQL in Supabase SQL Editor AFTER running all migrations
-- This will populate your database with realistic sample data
-- =================================================================

-- =================================================================
-- 1. USER PROFILES (3 users: Admin, Manager, Staff)
-- =================================================================
-- Note: You need to create these users in Supabase Auth first
-- Then update their profiles with roles

-- Example SQL to update existing users:
-- Replace the email addresses with actual users in your system

-- Set Arhum as Admin
UPDATE public.user_profiles 
SET role = 'admin', 
    full_name = 'Arhum Javaid',
    status = 'active'
WHERE email = 'arhum.javaid@gmail.com';

-- If you want to create additional sample users, do it through Supabase Auth
-- Then run these updates:

-- Sample Manager (create user in auth first)
-- UPDATE public.user_profiles 
-- SET role = 'manager', 
--     full_name = 'Sarah Johnson',
--     status = 'active'
-- WHERE email = 'sarah.manager@smartstock.com';

-- Sample Staff (create user in auth first)
-- UPDATE public.user_profiles 
-- SET role = 'staff', 
--     full_name = 'Mike Chen',
--     status = 'active'
-- WHERE email = 'mike.staff@smartstock.com';

-- =================================================================
-- 2. PRODUCTS (50 diverse products across categories)
-- =================================================================

INSERT INTO public.products (name, sku, category, description, price, cost, quantity, low_stock_threshold, reorder_quantity, unit, status) VALUES

-- Electronics (15 products)
('Samsung Galaxy S24', 'ELEC-001', 'Electronics', 'Latest Samsung flagship smartphone with 256GB storage', 899.99, 650.00, 45, 10, 20, 'unit', 'active'),
('Apple MacBook Air M2', 'ELEC-002', 'Electronics', '13-inch laptop with M2 chip, 8GB RAM, 256GB SSD', 1199.99, 900.00, 25, 5, 10, 'unit', 'active'),
('Sony WH-1000XM5 Headphones', 'ELEC-003', 'Electronics', 'Premium noise-cancelling wireless headphones', 349.99, 210.00, 60, 15, 30, 'unit', 'active'),
('Dell UltraSharp 27" Monitor', 'ELEC-004', 'Electronics', '4K IPS monitor with USB-C connectivity', 499.99, 320.00, 30, 8, 15, 'unit', 'active'),
('Logitech MX Master 3S Mouse', 'ELEC-005', 'Electronics', 'Wireless ergonomic mouse for professionals', 99.99, 55.00, 120, 20, 50, 'unit', 'active'),
('iPad Pro 12.9" M2', 'ELEC-006', 'Electronics', 'Tablet with M2 chip and Liquid Retina display', 1099.99, 800.00, 18, 5, 10, 'unit', 'active'),
('Samsung 65" QLED TV', 'ELEC-007', 'Electronics', '4K Smart TV with Quantum Dot technology', 1499.99, 1100.00, 12, 3, 8, 'unit', 'active'),
('Canon EOS R6 Camera', 'ELEC-008', 'Electronics', 'Full-frame mirrorless camera body', 2499.99, 1850.00, 8, 2, 5, 'unit', 'active'),
('Bose SoundLink Speaker', 'ELEC-009', 'Electronics', 'Portable Bluetooth speaker with 12-hour battery', 149.99, 85.00, 75, 15, 40, 'unit', 'active'),
('Apple Watch Series 9', 'ELEC-010', 'Electronics', 'GPS smartwatch with fitness tracking', 399.99, 280.00, 42, 10, 25, 'unit', 'active'),
('Kindle Paperwhite', 'ELEC-011', 'Electronics', 'Waterproof e-reader with adjustable light', 139.99, 85.00, 90, 20, 50, 'unit', 'active'),
('GoPro HERO 12', 'ELEC-012', 'Electronics', 'Action camera with 5.3K video', 399.99, 280.00, 35, 8, 20, 'unit', 'active'),
('PlayStation 5 Console', 'ELEC-013', 'Electronics', 'Next-gen gaming console with 825GB SSD', 499.99, 400.00, 6, 3, 10, 'unit', 'active'),
('Nintendo Switch OLED', 'ELEC-014', 'Electronics', 'Handheld gaming console with vibrant OLED screen', 349.99, 260.00, 28, 8, 20, 'unit', 'active'),
('DJI Mini 3 Pro Drone', 'ELEC-015', 'Electronics', 'Compact drone with 4K camera and 34-min flight', 759.99, 550.00, 15, 5, 10, 'unit', 'active'),

-- Home & Garden (12 products)
('Dyson V15 Vacuum', 'HOME-001', 'Home & Garden', 'Cordless vacuum with laser detection', 649.99, 450.00, 22, 5, 15, 'unit', 'active'),
('Philips Air Purifier', 'HOME-002', 'Home & Garden', 'HEPA air purifier for large rooms', 299.99, 180.00, 35, 8, 20, 'unit', 'active'),
('Keurig K-Elite Coffee Maker', 'HOME-003', 'Home & Garden', 'Single-serve coffee brewer with iced coffee', 169.99, 95.00, 48, 10, 25, 'unit', 'active'),
('iRobot Roomba j7+', 'HOME-004', 'Home & Garden', 'Self-emptying robot vacuum with AI obstacle avoidance', 799.99, 550.00, 18, 5, 10, 'unit', 'active'),
('Instant Pot Duo 7-in-1', 'HOME-005', 'Home & Garden', 'Multi-function pressure cooker 6 quart', 89.99, 48.00, 65, 15, 35, 'unit', 'active'),
('KitchenAid Stand Mixer', 'HOME-006', 'Home & Garden', '5-quart tilt-head mixer for baking', 379.99, 240.00, 28, 8, 15, 'unit', 'active'),
('Ninja Air Fryer', 'HOME-007', 'Home & Garden', '6-quart digital air fryer with multiple functions', 129.99, 70.00, 52, 12, 30, 'unit', 'active'),
('Nest Learning Thermostat', 'HOME-008', 'Home & Garden', 'Smart thermostat with energy savings', 249.99, 160.00, 40, 10, 25, 'unit', 'active'),
('Ring Video Doorbell Pro 2', 'HOME-009', 'Home & Garden', 'HD+ video doorbell with 3D motion detection', 249.99, 155.00, 55, 12, 30, 'unit', 'active'),
('Casper Original Mattress Queen', 'HOME-010', 'Home & Garden', 'Memory foam mattress with zoned support', 1095.00, 680.00, 8, 2, 6, 'unit', 'active'),
('Weber Genesis Gas Grill', 'HOME-011', 'Home & Garden', '3-burner propane grill with side burner', 899.99, 620.00, 10, 3, 8, 'unit', 'active'),
('Greenworks Electric Lawn Mower', 'HOME-012', 'Home & Garden', '20-inch corded electric mower', 249.99, 155.00, 15, 4, 10, 'unit', 'active'),

-- Clothing & Accessories (10 products)
('Nike Air Max 270 Shoes', 'CLTH-001', 'Clothing & Accessories', 'Men''s lifestyle sneakers with Max Air unit', 149.99, 75.00, 85, 20, 50, 'pair', 'active'),
('Levi''s 501 Original Jeans', 'CLTH-002', 'Clothing & Accessories', 'Classic straight leg jeans - various sizes', 69.99, 35.00, 120, 30, 60, 'unit', 'active'),
('North Face Thermoball Jacket', 'CLTH-003', 'Clothing & Accessories', 'Insulated jacket for cold weather', 229.99, 125.00, 45, 12, 30, 'unit', 'active'),
('Ray-Ban Aviator Sunglasses', 'CLTH-004', 'Clothing & Accessories', 'Classic metal frame with UV protection', 169.99, 85.00, 95, 20, 50, 'pair', 'active'),
('Adidas Ultraboost Running Shoes', 'CLTH-005', 'Clothing & Accessories', 'Performance running shoes with Boost foam', 179.99, 95.00, 70, 18, 40, 'pair', 'active'),
('Columbia Rain Jacket', 'CLTH-006', 'Clothing & Accessories', 'Waterproof hooded jacket for outdoor activities', 89.99, 48.00, 60, 15, 35, 'unit', 'active'),
('Timex Weekender Watch', 'CLTH-007', 'Clothing & Accessories', 'Casual analog watch with Indiglo backlight', 49.99, 22.00, 110, 25, 60, 'unit', 'active'),
('Herschel Little America Backpack', 'CLTH-008', 'Clothing & Accessories', '25L classic backpack with laptop sleeve', 109.99, 58.00, 75, 18, 40, 'unit', 'active'),
('Carhartt Work Pants', 'CLTH-009', 'Clothing & Accessories', 'Durable canvas work pants - various sizes', 54.99, 28.00, 90, 22, 50, 'unit', 'active'),
('Under Armour Compression Shirt', 'CLTH-010', 'Clothing & Accessories', 'Athletic performance shirt - moisture wicking', 34.99, 16.00, 140, 30, 70, 'unit', 'active'),

-- Sports & Outdoors (8 products)
('Bowflex SelectTech Dumbbells', 'SPRT-001', 'Sports & Outdoors', 'Adjustable dumbbells 5-52.5 lbs per hand', 349.99, 220.00, 28, 8, 15, 'set', 'active'),
('Schwinn IC4 Indoor Bike', 'SPRT-002', 'Sports & Outdoors', 'Magnetic resistance exercise bike with Bluetooth', 899.99, 580.00, 12, 3, 8, 'unit', 'active'),
('Coleman Sundome Tent 4-Person', 'SPRT-003', 'Sports & Outdoors', 'Easy setup camping tent with WeatherTec system', 89.99, 48.00, 35, 10, 25, 'unit', 'active'),
('Yeti Rambler 30oz Tumbler', 'SPRT-004', 'Sports & Outdoors', 'Insulated stainless steel tumbler', 37.99, 18.00, 180, 40, 100, 'unit', 'active'),
('Wilson Evolution Basketball', 'SPRT-005', 'Sports & Outdoors', 'Official size composite leather basketball', 64.99, 35.00, 55, 15, 35, 'unit', 'active'),
('Spalding NBA Portable Hoop', 'SPRT-006', 'Sports & Outdoors', '54-inch backboard with adjustable height', 399.99, 260.00, 8, 2, 6, 'unit', 'active'),
('Manduka PRO Yoga Mat', 'SPRT-007', 'Sports & Outdoors', 'Premium 6mm thick yoga mat with lifetime guarantee', 119.99, 65.00, 42, 12, 30, 'unit', 'active'),
('Penn Championship Tennis Balls', 'SPRT-008', 'Sports & Outdoors', 'USTA approved tennis balls - 3 ball can', 3.99, 1.80, 300, 80, 200, 'can', 'active'),

-- Books & Stationery (5 products)
('Moleskine Classic Notebook', 'BOOK-001', 'Books & Stationery', 'Hard cover ruled notebook large size', 19.99, 9.00, 150, 35, 80, 'unit', 'active'),
('Pilot G2 Pen Set', 'BOOK-002', 'Books & Stationery', 'Retractable gel pens 0.7mm - pack of 12', 14.99, 6.50, 220, 50, 120, 'pack', 'active'),
('Post-it Notes Value Pack', 'BOOK-003', 'Books & Stationery', 'Assorted sizes sticky notes - 24 pads', 24.99, 11.00, 185, 45, 100, 'pack', 'active'),
('HP Printer Paper 500 Sheets', 'BOOK-004', 'Books & Stationery', '8.5x11 copy paper 20lb white', 9.99, 4.50, 280, 70, 150, 'ream', 'active'),
('Staples Arc Notebook System', 'BOOK-005', 'Books & Stationery', 'Customizable disc-bound notebook with accessories', 29.99, 14.00, 95, 22, 50, 'unit', 'active');

-- =================================================================
-- 3. SALES TRANSACTIONS (30 sample sales)
-- =================================================================
-- Note: Replace 'YOUR_USER_ID_HERE' with actual user IDs from user_profiles table
-- Get user ID with: SELECT id FROM public.user_profiles WHERE email = 'your-email@example.com';

-- You'll need to run this query first to get your user ID:
-- SELECT id FROM public.user_profiles WHERE email = 'arhum.javaid@gmail.com';

-- Then replace 'YOUR_USER_ID_HERE' below with the actual UUID

-- For demo purposes, here's the structure:
/*
INSERT INTO public.sales (product_id, quantity, unit_price, customer_name, customer_email, sold_by, sold_at) VALUES
((SELECT id FROM public.products WHERE sku = 'ELEC-001'), 2, 899.99, 'John Smith', 'john.smith@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '5 days'),
((SELECT id FROM public.products WHERE sku = 'ELEC-003'), 1, 349.99, 'Emily Davis', 'emily.d@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '5 days'),
((SELECT id FROM public.products WHERE sku = 'CLTH-001'), 3, 149.99, 'Michael Brown', 'mbrown@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '4 days'),
((SELECT id FROM public.products WHERE sku = 'HOME-005'), 2, 89.99, 'Sarah Johnson', 'sarah.j@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '4 days'),
((SELECT id FROM public.products WHERE sku = 'ELEC-011'), 4, 139.99, 'David Wilson', 'dwilson@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '4 days'),
((SELECT id FROM public.products WHERE sku = 'BOOK-002'), 10, 14.99, 'Lisa Anderson', 'landerson@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '3 days'),
((SELECT id FROM public.products WHERE sku = 'SPRT-004'), 5, 37.99, 'Robert Taylor', 'rtaylor@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '3 days'),
((SELECT id FROM public.products WHERE sku = 'ELEC-005'), 3, 99.99, 'Jennifer Martinez', 'jmartinez@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '3 days'),
((SELECT id FROM public.products WHERE sku = 'HOME-007'), 2, 129.99, 'James Lee', 'jlee@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '2 days'),
((SELECT id FROM public.products WHERE sku = 'CLTH-002'), 5, 69.99, 'Patricia Garcia', 'pgarcia@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '2 days'),
((SELECT id FROM public.products WHERE sku = 'ELEC-009'), 2, 149.99, 'Christopher White', 'cwhite@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '2 days'),
((SELECT id FROM public.products WHERE sku = 'BOOK-003'), 8, 24.99, 'Mary Thompson', 'mthompson@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '1 day'),
((SELECT id FROM public.products WHERE sku = 'SPRT-005'), 2, 64.99, 'Daniel Harris', 'dharris@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '1 day'),
((SELECT id FROM public.products WHERE sku = 'HOME-003'), 3, 169.99, 'Barbara Clark', 'bclark@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '1 day'),
((SELECT id FROM public.products WHERE sku = 'ELEC-010'), 1, 399.99, 'Thomas Lewis', 'tlewis@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '1 day'),
((SELECT id FROM public.products WHERE sku = 'CLTH-004'), 4, 169.99, 'Nancy Walker', 'nwalker@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '12 hours'),
((SELECT id FROM public.products WHERE sku = 'ELEC-014'), 2, 349.99, 'Kevin Hall', 'khall@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '12 hours'),
((SELECT id FROM public.products WHERE sku = 'HOME-002'), 1, 299.99, 'Karen Allen', 'kallen@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '10 hours'),
((SELECT id FROM public.products WHERE sku = 'SPRT-007'), 3, 119.99, 'Steven Young', 'syoung@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '8 hours'),
((SELECT id FROM public.products WHERE sku = 'BOOK-001'), 6, 19.99, 'Betty King', 'bking@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '8 hours'),
((SELECT id FROM public.products WHERE sku = 'ELEC-012'), 1, 399.99, 'Edward Wright', 'ewright@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '6 hours'),
((SELECT id FROM public.products WHERE sku = 'CLTH-006'), 4, 89.99, 'Dorothy Scott', 'dscott@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '5 hours'),
((SELECT id FROM public.products WHERE sku = 'HOME-009'), 2, 249.99, 'Jason Green', 'jgreen@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '4 hours'),
((SELECT id FROM public.products WHERE sku = 'SPRT-008'), 20, 3.99, 'Helen Baker', 'hbaker@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '3 hours'),
((SELECT id FROM public.products WHERE sku = 'ELEC-004'), 1, 499.99, 'Ryan Adams', 'radams@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '2 hours'),
((SELECT id FROM public.products WHERE sku = 'CLTH-008'), 2, 109.99, 'Sandra Nelson', 'snelson@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '2 hours'),
((SELECT id FROM public.products WHERE sku = 'HOME-008'), 3, 249.99, 'Brian Carter', 'bcarter@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '1 hour'),
((SELECT id FROM public.products WHERE sku = 'BOOK-004'), 15, 9.99, 'Ashley Mitchell', 'amitchell@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '1 hour'),
((SELECT id FROM public.products WHERE sku = 'CLTH-007'), 5, 49.99, 'Joshua Perez', 'jperez@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '30 minutes'),
((SELECT id FROM public.products WHERE sku = 'ELEC-009'), 1, 149.99, 'Amanda Roberts', 'aroberts@email.com', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '15 minutes');


-- IMPORTANT: Uncomment and run the above sales INSERT after replacing YOUR_USER_ID_HERE

-- =================================================================
-- 4. PURCHASE ORDERS (20 sample purchases)
-- =================================================================
-- Note: Replace 'YOUR_USER_ID_HERE' with actual user ID

/*
INSERT INTO public.purchases (product_id, quantity, unit_cost, supplier_name, supplier_email, status, purchased_by, purchased_at) VALUES
((SELECT id FROM public.products WHERE sku = 'ELEC-001'), 50, 650.00, 'Samsung Electronics Co.', 'orders@samsung.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '30 days'),
((SELECT id FROM public.products WHERE sku = 'ELEC-002'), 30, 900.00, 'Apple Inc.', 'business@apple.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '28 days'),
((SELECT id FROM public.products WHERE sku = 'ELEC-003'), 75, 210.00, 'Sony Corporation', 'b2b@sony.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '25 days'),
((SELECT id FROM public.products WHERE sku = 'HOME-001'), 25, 450.00, 'Dyson Ltd', 'wholesale@dyson.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '25 days'),
((SELECT id FROM public.products WHERE sku = 'CLTH-001'), 100, 75.00, 'Nike Inc.', 'retail@nike.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '22 days'),
((SELECT id FROM public.products WHERE sku = 'BOOK-002'), 250, 6.50, 'Pilot Pen Corporation', 'sales@pilotpen.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '20 days'),
((SELECT id FROM public.products WHERE sku = 'SPRT-004'), 200, 18.00, 'YETI Holdings Inc.', 'orders@yeti.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '18 days'),
((SELECT id FROM public.products WHERE sku = 'ELEC-011'), 100, 85.00, 'Amazon.com Inc.', 'kindle-orders@amazon.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '15 days'),
((SELECT id FROM public.products WHERE sku = 'HOME-005'), 80, 48.00, 'Instant Brands Inc.', 'b2b@instantbrands.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '15 days'),
((SELECT id FROM public.products WHERE sku = 'CLTH-002'), 150, 35.00, 'Levi Strauss & Co.', 'wholesale@levi.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '12 days'),
((SELECT id FROM public.products WHERE sku = 'ELEC-005'), 150, 55.00, 'Logitech International', 'partners@logitech.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '10 days'),
((SELECT id FROM public.products WHERE sku = 'BOOK-003'), 200, 11.00, '3M Company', 'postit-orders@3m.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '8 days'),
((SELECT id FROM public.products WHERE sku = 'HOME-007'), 60, 70.00, 'SharkNinja Operating LLC', 'wholesale@sharkninja.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '7 days'),
((SELECT id FROM public.products WHERE sku = 'SPRT-008'), 400, 1.80, 'Penn Racquet Sports', 'orders@pennracquet.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '5 days'),
((SELECT id FROM public.products WHERE sku = 'ELEC-010'), 50, 280.00, 'Apple Inc.', 'business@apple.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '4 days'),
((SELECT id FROM public.products WHERE sku = 'CLTH-004'), 120, 85.00, 'Luxottica Group', 'rayban-b2b@luxottica.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '3 days'),
((SELECT id FROM public.products WHERE sku = 'HOME-003'), 60, 95.00, 'Keurig Dr Pepper Inc.', 'keurig-orders@kdrp.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '2 days'),
((SELECT id FROM public.products WHERE sku = 'BOOK-001'), 180, 9.00, 'Moleskine Srl', 'trade@moleskine.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '1 day'),
((SELECT id FROM public.products WHERE sku = 'ELEC-009'), 85, 85.00, 'Bose Corporation', 'partners@bose.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '12 hours'),
((SELECT id FROM public.products WHERE sku = 'SPRT-007'), 50, 65.00, 'Manduka LLC', 'wholesale@manduka.com', 'completed', 'YOUR_USER_ID_HERE', NOW() - INTERVAL '6 hours');
*/

-- IMPORTANT: Uncomment and run the above purchases INSERT after replacing YOUR_USER_ID_HERE

-- =================================================================
-- INSTRUCTIONS TO COMPLETE SAMPLE DATA INSERTION
-- =================================================================

/*
STEP-BY-STEP GUIDE:

1. First, get your user ID:
   SELECT id, email, full_name, role FROM public.user_profiles;
   
   Copy your user ID (UUID format)

2. Replace 'YOUR_USER_ID_HERE' in the sales INSERT statements above with your actual UUID

3. Uncomment the sales INSERT block (remove the /* and */)

4. Run the sales INSERT statements

5. Replace 'YOUR_USER_ID_HERE' in the purchases INSERT statements with your actual UUID

6. Uncomment the purchases INSERT block

7. Run the purchases INSERT statements

8. Verify the data:
   SELECT COUNT(*) FROM public.products;  -- Should return 50
   SELECT COUNT(*) FROM public.sales;     -- Should return 30
   SELECT COUNT(*) FROM public.purchases; -- Should return 20

9. Check dashboard data:
   SELECT 
     (SELECT COUNT(*) FROM public.products WHERE status = 'active') as total_products,
     (SELECT SUM(total_price) FROM public.sales WHERE DATE(sold_at) = CURRENT_DATE) as sales_today,
     (SELECT COUNT(*) FROM public.products WHERE quantity <= low_stock_threshold) as low_stock_items;

NOTES:
- Products are automatically inserted and ready to use
- Sales will automatically decrease product quantities (triggers handle this)
- Purchases will automatically increase product quantities
- Some products will show low stock alerts after sales
- The sample data spans the last 30 days for realistic reporting
*/

-- =================================================================
-- QUICK DATA VERIFICATION QUERIES
-- =================================================================

-- Check products by category
SELECT category, COUNT(*) as product_count, SUM(quantity) as total_stock
FROM public.products
GROUP BY category
ORDER BY category;

-- Check recent sales
SELECT 
  s.sold_at,
  p.name as product_name,
  s.quantity,
  s.total_price,
  s.customer_name,
  u.full_name as sold_by
FROM public.sales s
JOIN public.products p ON s.product_id = p.id
JOIN public.user_profiles u ON s.sold_by = u.id
ORDER BY s.sold_at DESC
LIMIT 10;

-- Check products with low stock
SELECT 
  name,
  sku,
  category,
  quantity,
  low_stock_threshold,
  (quantity - low_stock_threshold) as stock_difference
FROM public.products
WHERE quantity <= low_stock_threshold
ORDER BY quantity ASC;

-- Check total inventory value
SELECT 
  category,
  COUNT(*) as products,
  SUM(quantity) as total_units,
  SUM(quantity * cost) as inventory_cost_value,
  SUM(quantity * price) as inventory_retail_value,
  SUM(quantity * (price - cost)) as potential_profit
FROM public.products
WHERE status = 'active'
GROUP BY category
ORDER BY inventory_retail_value DESC;

-- =================================================================
-- END OF SAMPLE DATA
-- =================================================================
