# 📦 SmartStock - Inventory Management System# 📦 SmartStock - Inventory Management System



> A modern, full-stack inventory management system built with React.js, Supabase, and TailwindCSS. Complete with real-time data synchronization, advanced reporting, and role-based access control.> A modern, full-stack inventory management system built with React.js, Supabase, and TailwindCSS. Perfect for SMEs, retailers, and warehouses.



![Status](https://img.shields.io/badge/Status-Production%20Ready-success)![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

![React](https://img.shields.io/badge/React-19.1.1-blue)![React](https://img.shields.io/badge/React-19.1.1-blue)

![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.14-cyan)![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.14-cyan)

![Vite](https://img.shields.io/badge/Vite-7.1.9-purple)

---

---

## 📋 Table of Contents

## 📋 Table of Contents

- [Features](#-features)

- [Features](#-features)- [Tech Stack](#-tech-stack)

- [Tech Stack](#-tech-stack)- [Project Structure](#-project-structure)

- [Project Structure](#-project-structure)- [Getting Started](#-getting-started)

- [Quick Start](#-quick-start)- [Database Schema](#-database-schema)

- [Database Setup](#-database-setup)- [Authentication](#-authentication)

- [Authentication](#-authentication)- [API Reference](#-api-reference)

- [Core Features](#-core-features)- [Edge Functions](#-edge-functions)

- [Edge Functions](#-edge-functions)- [Deployment](#-deployment)

- [Deployment](#-deployment)- [Usage Guide](#-usage-guide)

- [Testing](#-testing)- [Troubleshooting](#-troubleshooting)

- [Troubleshooting](#-troubleshooting)

- [Contributing](#-contributing)---



---## ✨ Features



## ✨ Features### 🔐 Authentication & Authorization

- ✅ **Secure Login/Signup** - Email & password authentication

### 🔐 **Authentication & Security**- ✅ **Role-Based Access Control (RBAC)** - Admin, Manager, Staff roles

- ✅ Email & password authentication via Supabase- ✅ **Protected Routes** - Route guards for authenticated users

- ✅ Role-Based Access Control (Admin, Manager, Staff)- ✅ **Session Management** - Automatic token refresh

- ✅ Protected routes with authentication guards- ✅ **Password Validation** - Minimum security requirements

- ✅ Secure session management with automatic token refresh- ✅ **Dynamic User Menu** - Displays logged-in user info

- ✅ Password validation and security requirements

- ✅ User profile management### 📊 Dashboard

- ✅ **Real-Time Statistics**

### 📊 **Dashboard Analytics**  - Total Products count

- ✅ Real-time statistics (Products, Sales, Revenue, Alerts)  - Sales Today with trends

- ✅ Interactive charts (Sales trends, Category distribution)  - Low Stock Alerts

- ✅ 7-day sales vs. purchase comparison (Line chart)  - Total Orders

- ✅ Stock by category visualization (Bar chart)- ✅ **Interactive Charts**

- ✅ Low stock alerts with threshold monitoring  - Sales & Purchase trend analysis (Line chart)

- ✅ Recently added products widget  - Stock by category distribution (Bar chart)

- ✅ **Smart Widgets**

### 📦 **Product Management**  - Low stock alerts with reorder levels

- ✅ Full CRUD operations (Create, Read, Update, Delete)  - Recently added products

- ✅ 15 comprehensive product fields  - Quick action buttons

- ✅ 5 product categories (Electronics, Home & Garden, Clothing, Sports, Books)

- ✅ Stock status badges (In Stock, Low Stock, Out of Stock)### 📦 Product Management

- ✅ Search by name or SKU- ✅ **Complete CRUD Operations**

- ✅ Filter by category  - Add new products with validation

- ✅ Soft delete (status: active/inactive)  - Edit existing products

  - Delete products with confirmation

### 💰 **Sales Management**  - Real-time stock updates

- ✅ Record sales transactions- ✅ **Product Features**

- ✅ Product selection with live stock availability  - SKU tracking and management

- ✅ Customer tracking (Name, Email)  - Category organization

- ✅ Automatic stock deduction via database triggers  - Price and cost tracking

- ✅ Real-time stock validation  - Stock level monitoring

- ✅ Sales history with last 50 transactions  - Low stock threshold alerts

- ✅ Today's sales statistics  - Product status (Active/Discontinued)

- ✅ Revenue tracking- ✅ **Search & Filter**

  - Search by name or SKU

### 🛒 **Purchase Management**  - Filter by category

- ✅ Record purchase orders  - Sort by any column

- ✅ Supplier tracking (Name, Email)

- ✅ Automatic stock increase via database triggers### 💰 Sales Management

- ✅ Cost management and calculations- ✅ **Sales Recording**

- ✅ Purchase history with last 50 orders  - Product selection with live stock levels

- ✅ Today's purchases statistics  - Quantity validation against available stock

- ✅ Spending tracking  - Customer name tracking

  - Real-time total calculation

### 📈 **Advanced Reporting**  - Payment method selection

- ✅ **4 Report Types**: Sales, Stock, Purchase, Profit Analysis  - Remaining stock preview

- ✅ **3 Export Formats**: PDF, Excel (.xls), CSV- ✅ **Sales History**

- ✅ Date range filtering  - Complete transaction log

- ✅ Category filtering  - Date, product, quantity, revenue tracking

- ✅ Summary statistics (Total revenue, profit, units sold)  - Today's sales statistics

- ✅ Real-time data aggregation  - Sales by staff member



---### 📥 Purchase Management

- ✅ **Purchase Recording**

## 🛠️ Tech Stack  - Product selection with current stock

  - Supplier management

### **Frontend**  - Unit cost tracking

- **React 19.1.1** - UI framework  - Purchase date recording

- **Vite 7.1.9** - Build tool and dev server  - Stock level preview after purchase

- **TailwindCSS 4.1.14** - Utility-first CSS  - Payment method tracking

- **React Router DOM 7.2.0** - Client-side routing- ✅ **Purchase History**

- **Lucide React 0.468.0** - Icon library  - Complete purchase log

- **Recharts 2.15.0** - Chart library  - Supplier tracking

  - Cost analysis

### **Backend**  - Purchase by staff member

- **Supabase** - Backend-as-a-Service

  - PostgreSQL database### 📈 Reports & Analytics

  - Authentication & authorization- ✅ **Report Types**

  - Edge Functions (Deno runtime)  - Sales Report (revenue, profit, units sold)

  - Row Level Security (RLS)  - Stock Report (current levels, status)

  - Real-time subscriptions  - Profit Analysis

  - Purchase Report

### **Development Tools**  - Category Analysis

- **ESLint 9.17.0** - Code linting  - Staff Performance

- **PostCSS 8.4.49** - CSS processing- ✅ **Filtering Options**

- **Autoprefixer** - CSS vendor prefixing  - Date range selection

  - Category filtering

---  - Custom report generation

- ✅ **Database Views**

## 📁 Project Structure  - Daily sales report

  - Product performance

```  - Monthly sales summary

inventory_managment/  - Top selling products

├── src/  - Inventory value report

│   ├── components/

│   │   ├── layout/### 👥 User Management (Admin Only)

│   │   │   ├── MainLayout.jsx      # Main app layout- ✅ **User Operations**

│   │   │   ├── Sidebar.jsx         # Navigation sidebar  - Create new users with role assignment

│   │   │   └── TopNav.jsx          # Top navigation  - Edit user details and roles

│   │   ├── ui/  - Delete users from system

│   │   │   ├── Alert.jsx           # Alert component  - Toggle user status (Active/Inactive)

│   │   │   ├── Button.jsx          # Button component  - Search and filter users

│   │   │   ├── Card.jsx            # Card container- ✅ **Role Management**

│   │   │   ├── Input.jsx           # Form input  - **Admin** - Full system access, user management

│   │   │   ├── Modal.jsx           # Modal dialog  - **Manager** - Product, sales, purchases, reports

│   │   │   └── Table.jsx           # Data table  - **Staff** - Products, sales, purchases (limited)

│   │   ├── ProtectedRoute.jsx      # Auth guard- ✅ **User Statistics**

│   │   └── PublicRoute.jsx         # Public guard  - Total users count

│   ├── pages/  - Active users

│   │   ├── auth/  - Users by role

│   │   │   ├── Login.jsx           # Login page  - Join date tracking

│   │   │   └── Signup.jsx          # Registration

│   │   ├── Dashboard.jsx           # Dashboard### 🎨 UI/UX Features

│   │   ├── Products.jsx            # Products- ✅ **Fully Responsive** - Desktop, tablet, and mobile optimized

│   │   ├── Sales.jsx               # Sales- ✅ **Modern Design** - Clean interface with gradient cards

│   │   ├── Purchases.jsx           # Purchases- ✅ **Collapsible Sidebar** - Space-efficient navigation

│   │   ├── Reports.jsx             # Reports- ✅ **Top Navigation** - Search, notifications, user menu

│   │   └── Users.jsx               # Users- ✅ **Modal Forms** - Clean add/edit interfaces

│   ├── lib/- ✅ **Alert System** - Success, error, warning messages

│   │   └── supabase.js             # Supabase config- ✅ **Icon Integration** - Lucide React icons throughout

│   ├── App.jsx                      # Main app- ✅ **Loading States** - Skeleton loaders and spinners

│   ├── main.jsx                     # Entry point- ✅ **Color-Coded Status** - Visual indicators for stock levels, roles

│   └── index.css                    # Global styles- ✅ **Smooth Transitions** - Professional animations

├── supabase/

│   ├── functions/---

│   │   ├── export-report/          # Export function

│   │   ├── generate-report/        # Report generation## 🛠️ Tech Stack

│   │   ├── manage-user/            # User management

│   │   ├── record-purchase/        # Purchase processing### Frontend

│   │   └── record-sale/            # Sales processing| Technology | Version | Purpose |

│   └── migrations/|------------|---------|---------|

│       ├── 001_create_user_roles_table.sql| **React** | 19.1.1 | UI Framework |

│       ├── 002_create_products_table.sql| **React Router** | 7.9.3 | Client-side routing |

│       ├── 003_create_sales_table.sql| **TailwindCSS** | 4.1.14 | Styling framework |

│       ├── 004_create_purchases_table.sql| **Recharts** | 3.2.1 | Data visualization |

│       ├── 005_create_alerts_table.sql| **Lucide React** | 0.544.0 | Icon library |

│       └── 006_create_reports_and_views.sql| **Vite** | 7.1.9 | Build tool |

└── README.md                        # This file| **ESLint** | 9.36.0 | Code linting |

```

### Backend

---| Technology | Purpose |

|------------|---------|

## 🚀 Quick Start| **Supabase** | Backend-as-a-Service |

| **PostgreSQL** | Relational database |

### Prerequisites| **Supabase Auth** | Authentication system |

| **Edge Functions** | Serverless functions |

- Node.js 18+ installed| **Row Level Security** | Database security |

- npm or yarn package manager| **Realtime** | Live data subscriptions |

- Supabase account (free tier available)

---

### 1. Clone the Repository

## 📁 Project Structure

```bash

git clone https://github.com/TalalAhmed31/inventory_managment.git```

cd inventory_managmentinventory_managment/

```├── public/

│   └── vite.svg

### 2. Install Dependencies├── src/

│   ├── assets/

```bash│   │   └── react.svg

npm install│   ├── components/

```│   │   ├── layout/

│   │   │   ├── MainLayout.jsx          # Main app layout

### 3. Environment Setup│   │   │   ├── Sidebar.jsx             # Navigation sidebar (role-based)

│   │   │   └── TopNav.jsx              # Top navigation bar

Create a `.env` file in the root directory:│   │   ├── ui/

│   │   │   ├── Alert.jsx               # Alert notifications

```env│   │   │   ├── Button.jsx              # Reusable buttons

VITE_SUPABASE_URL=your_supabase_project_url│   │   │   ├── Card.jsx                # Card containers

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key│   │   │   ├── Input.jsx               # Form inputs

```│   │   │   ├── Modal.jsx               # Modal dialogs

│   │   │   └── Table.jsx               # Data tables

Get these values from your Supabase project:│   │   ├── ProtectedRoute.jsx          # Route guard

- Go to https://app.supabase.com│   │   └── PublicRoute.jsx             # Public route wrapper

- Select your project → Settings → API│   ├── lib/

- Copy `Project URL` and `anon public` key│   │   └── supabase.js                 # Supabase client config

│   ├── pages/

### 4. Database Setup│   │   ├── auth/

│   │   │   ├── Login.jsx               # Login page

Run migrations in Supabase SQL Editor (in order):│   │   │   └── Signup.jsx              # Registration page

1. `001_create_user_roles_table.sql`│   │   ├── Dashboard.jsx               # Main dashboard

2. `002_create_products_table.sql`│   │   ├── Products.jsx                # Product management

3. `003_create_sales_table.sql`│   │   ├── Sales.jsx                   # Sales entry & history

4. `004_create_purchases_table.sql`│   │   ├── Purchases.jsx               # Purchase management

5. `005_create_alerts_table.sql`│   │   ├── Reports.jsx                 # Reports & analytics

6. `006_create_reports_and_views.sql`│   │   └── Users.jsx                   # User management (Admin)

│   ├── App.jsx                         # Router configuration

### 5. Deploy Edge Functions│   ├── main.jsx                        # App entry point

│   └── index.css                       # Global styles

```bash├── supabase/

# Install Supabase CLI│   ├── functions/

npm install -g supabase│   │   ├── record-sale/

│   │   │   └── index.ts                # Sale recording function

# Login│   │   ├── record-purchase/

supabase login│   │   │   └── index.ts                # Purchase recording function

│   │   ├── generate-report/

# Link to project│   │   │   └── index.ts                # Report generation

supabase link --project-ref your_project_ref│   │   └── manage-user/

│   │       └── index.ts                # User management

# Deploy export function│   └── migrations/

supabase functions deploy export-report│       ├── 001_create_user_roles_table.sql

```│       ├── 002_create_products_table.sql

│       ├── 003_create_sales_table.sql

### 6. Run Development Server│       ├── 004_create_purchases_table.sql

│       ├── 005_create_alerts_table.sql

```bash│       └── 006_create_reports_and_views.sql

npm run dev├── package.json

```├── vite.config.js

├── tailwind.config.js

Visit `http://localhost:5173`├── eslint.config.js

└── README.md

### 7. Build for Production```



```bash---

npm run build

npm run preview## 🚀 Getting Started

```

### Prerequisites

---- Node.js 18+ and npm

- Supabase account (free tier works)

## 🗄️ Database Setup- Modern web browser

- Git (optional)

### Tables

### Step 1: Clone & Install

#### **user_profiles** (7 columns)

```sql```bash

- id (UUID, Primary Key)# Clone the repository

- email (TEXT)git clone https://github.com/TalalAhmed31/inventory_managment.git

- full_name (TEXT)cd inventory_managment

- role (TEXT) -- admin, manager, staff

- created_at, updated_at, last_login# Install dependencies

```npm install

```

#### **products** (15 columns)

```sql### Step 2: Configure Supabase

- id, name, sku, category, description

- price, cost, quantity, unit1. **Create Supabase Project**

- low_stock_threshold, reorder_quantity   - Go to [supabase.com](https://supabase.com)

- supplier, location, barcode, status   - Create a new project

- created_at, updated_at, created_by   - Note your project URL and anon key

```

2. **Update Configuration**

#### **sales** (12 columns)   - Open `src/lib/supabase.js`

```sql   - Replace with your credentials:

- id, product_id, quantity   ```javascript

- unit_price, total_price   const supabaseUrl = 'YOUR_SUPABASE_URL'

- customer_name, customer_email   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

- payment_method, payment_status   ```

- notes, sold_at, sold_by

```### Step 3: Run Database Migrations



#### **purchases** (15 columns)Open Supabase SQL Editor and run migrations in order:

```sql

- id, product_id, quantity```sql

- unit_cost, total_cost-- Run each file from supabase/migrations/ folder

- supplier_name, supplier_email-- 001_create_user_roles_table.sql

- invoice_number, payment_method-- 002_create_products_table.sql

- payment_status, delivery_date-- 003_create_sales_table.sql

- notes, purchased_at, purchased_by-- 004_create_purchases_table.sql

```-- 005_create_alerts_table.sql

-- 006_create_reports_and_views.sql

#### **alerts** (13 columns)```

```sql

- id, type, severity**Important:** Fix RLS policy recursion issue by running:

- title, message, product_id

- threshold, current_value```sql

- status, created_at-- Fix infinite recursion in RLS policies

- resolved_at, resolved_by, metadataDROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

```DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;



### Database Triggers-- Create helper function

CREATE OR REPLACE FUNCTION public.is_admin()

**Auto-Update Stock:**RETURNS BOOLEAN AS $$

- Decrease stock on saleBEGIN

- Increase stock on purchase  RETURN EXISTS (

- Generate low stock alerts    SELECT 1 FROM public.user_profiles

    WHERE id = auth.uid() AND role = 'admin'

---  );

END;

## 🔐 Authentication$$ LANGUAGE plpgsql SECURITY DEFINER;



### Sign Up-- Create corrected policies

```javascriptCREATE POLICY "Users can view own profile"

const { data, error } = await supabase.auth.signUp({ON public.user_profiles FOR SELECT

  email: 'user@example.com',USING (auth.uid() = id);

  password: 'password123'

});CREATE POLICY "Admins can view all profiles"

```ON public.user_profiles FOR SELECT

USING (public.is_admin());

### Sign In

```javascriptCREATE POLICY "Admins can manage all profiles"

const { data, error } = await supabase.auth.signInWithPassword({ON public.user_profiles FOR ALL

  email: 'user@example.com',USING (public.is_admin());

  password: 'password123'

});GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

``````



### Check Auth State### Step 4: Deploy Edge Functions (Optional)

```javascript

const { data: { user } } = await supabase.auth.getUser();```bash

```# Install Supabase CLI

npm install -g supabase

---

# Link to your project

## 💻 Core Featuressupabase link --project-ref YOUR_PROJECT_REF



### Dashboard# Deploy functions

- Real-time statistics cardssupabase functions deploy record-sale

- 7-day sales vs purchases chartsupabase functions deploy record-purchase

- Stock by category chartsupabase functions deploy generate-report

- Low stock alerts tablesupabase functions deploy manage-user

- Recent products widget```



### Products### Step 5: Start Development Server

- Add/Edit/Delete products

- 15 fields per product```bash

- Search and filternpm run dev

- Stock status badges```

- Soft delete support

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Sales

- Record sales transactions### Step 6: Create First User

- Customer tracking

- Auto stock deduction1. Navigate to signup page

- Real-time validation2. Create account with email and password

- Sales history (last 50)3. Go to Supabase dashboard → SQL Editor

4. Set admin role:

### Purchases

- Record purchase orders```sql

- Supplier trackingUPDATE user_profiles 

- Auto stock increaseSET role = 'admin' 

- Cost calculationsWHERE email = 'your-email@example.com';

- Purchase history (last 50)```



### Reports---

- **4 Report Types:**

  1. Sales Report## 🗄️ Database Schema

  2. Stock Report

  3. Purchase Report### Tables Overview

  4. Profit Analysis

```

- **3 Export Formats:**┌─────────────────────┐

  1. PDF (print dialog)│   USER_PROFILES     │

  2. Excel (.xls with styling)├─────────────────────┤

  3. CSV (direct download)│ • id (UUID)         │

│ • email             │

---│ • full_name         │

│ • role (enum)       │──────┐

## ⚙️ Edge Functions│ • status            │      │

│ • created_at        │      │

### export-report└─────────────────────┘      │

         │                   │

Export reports in PDF, Excel, or CSV formats.         │                   │

         ▼                   │

**Usage:**┌─────────────────────┐      │

```javascript│     PRODUCTS        │      │

const { data, error } = await supabase.functions.invoke('export-report', {├─────────────────────┤      │

  body: {│ • id (UUID)         │◄─────┼─┐

    reportType: 'sales',│ • name              │      │ │

    format: 'pdf',│ • sku               │      │ │

    startDate: '2024-01-01',│ • category          │      │ │

    endDate: '2024-12-31',│ • price             │      │ │

    categoryFilter: 'Electronics',│ • cost              │      │ │

    data: reportData│ • quantity          │      │ │

  }│ • low_stock_thresh  │      │ │

});│ • status            │      │ │

```└─────────────────────┘      │ │

         │                   │ │

**Features:**    ┌────┴────┐             │ │

- Professional formatting    ▼         ▼             │ │

- Summary statistics┌─────────┐ ┌──────────┐    │ │

- Authentication required│  SALES  │ │PURCHASES │    │ │

- All report types supported├─────────┤ ├──────────┤    │ │

│ • id    │ │ • id     │    │ │

### Other Functions│ • prod──┼─┘ • prod───┼────┘ │

- `generate-report` - Generate various reports│ • qty   │   • qty    │      │

- `record-sale` - Process sales with validation│ • price │   • cost   │      │

- `record-purchase` - Process purchases│ • sold──┼─────────────┘      │

- `manage-user` - User management operations│ • date  │   • purch──────────┘

└─────────┘   • date   │

---              └────────┘

```

## 🚀 Deployment

### Key Tables

### Vercel (Recommended)

#### 1. user_profiles

```bashStores user information and roles.

npm install -g vercel

vercel| Column | Type | Description |

```|--------|------|-------------|

| id | UUID | Primary key (from auth.users) |

Set environment variables in Vercel:| email | TEXT | User email (unique) |

- `VITE_SUPABASE_URL`| full_name | TEXT | Display name |

- `VITE_SUPABASE_ANON_KEY`| role | ENUM | admin, manager, staff |

| status | TEXT | active, inactive |

### Netlify| created_at | TIMESTAMP | Account creation date |



```bash#### 2. products

npm install -g netlify-cliInventory items and stock tracking.

npm run build

netlify deploy --prod --dir=dist| Column | Type | Description |

```|--------|------|-------------|

| id | UUID | Primary key |

### Edge Functions| name | TEXT | Product name |

| sku | TEXT | Stock keeping unit (unique) |

```bash| category | TEXT | Product category |

supabase functions deploy export-report| price | DECIMAL | Selling price |

supabase functions deploy generate-report| cost | DECIMAL | Purchase cost |

supabase functions deploy record-sale| quantity | INTEGER | Current stock level |

supabase functions deploy record-purchase| low_stock_threshold | INTEGER | Alert threshold |

```| status | ENUM | active, discontinued |



---#### 3. sales

Sales transaction records.

## 🧪 Testing

| Column | Type | Description |

### Export Reports|--------|------|-------------|

1. Navigate to Reports page| id | UUID | Primary key |

2. Select report type| product_id | UUID | Foreign key to products |

3. Choose date range/filter| quantity | INTEGER | Units sold |

4. Click export button| unit_price | DECIMAL | Price per unit |

5. Verify download/print| total_price | DECIMAL | Total sale amount (computed) |

| customer_name | TEXT | Customer name |

### CRUD Operations| sold_by | UUID | Foreign key to user_profiles |

- **Products**: Create, edit, delete, search, filter| sold_at | TIMESTAMP | Transaction timestamp |

- **Sales**: Record sale, verify stock decrease

- **Purchases**: Record order, verify stock increase#### 4. purchases

Purchase order records.

### Authentication

- Register new user| Column | Type | Description |

- Login with credentials|--------|------|-------------|

- Access protected routes| id | UUID | Primary key |

- Logout successfully| product_id | UUID | Foreign key to products |

| quantity | INTEGER | Units purchased |

---| unit_cost | DECIMAL | Cost per unit |

| total_cost | DECIMAL | Total purchase amount (computed) |

## 🔧 Troubleshooting| supplier_name | TEXT | Supplier name |

| purchased_by | UUID | Foreign key to user_profiles |

### Common Issues| purchased_at | TIMESTAMP | Transaction timestamp |



**Cannot connect to Supabase**#### 5. alerts

- Check `.env` credentialsSystem alerts and notifications.

- Verify project is not paused

| Column | Type | Description |

**Export not working**|--------|------|-------------|

- Deploy edge function: `supabase functions deploy export-report`| id | UUID | Primary key |

- Check logs: `supabase functions logs export-report`| type | ENUM | low_stock, out_of_stock, etc. |

| severity | ENUM | info, warning, critical |

**Products not showing**| message | TEXT | Alert message |

- Verify database has data| product_id | UUID | Related product (optional) |

- Check RLS policies| status | ENUM | unread, read, resolved |

- Check browser console| created_at | TIMESTAMP | Alert creation time |



**Stock not updating**### Database Views

- Verify database triggers exist

- Check product has stockThe system includes 7 optimized views for analytics:

- Verify trigger functions

1. **daily_sales_report** - Daily sales aggregation

**Authentication errors**2. **product_performance** - Product analytics with profit

- Clear browser cache3. **monthly_sales_summary** - Monthly trends

- Check Supabase auth settings4. **category_sales_analysis** - Sales by category

- Verify email confirmation5. **top_selling_products** - Best performers

6. **inventory_value_report** - Stock valuation

---7. **user_activity_summary** - Staff performance



## 📊 Sample Data---



The project includes SQL scripts for sample data:## 🔐 Authentication

- **50 Products** across 5 categories

- **30 Sales Transactions** (last 5 days)### Authentication Flow

- **20 Purchase Orders** (last 30 days)

- **Auto-generated Low Stock Alerts**```

┌─────────┐

Run the SQL scripts in Supabase SQL Editor to populate your database.│ Signup  │

└────┬────┘

---     │

     ▼

## 🤝 Contributing┌─────────────────┐

│ Supabase Auth   │
[//]: # (CHATBOT DOCUMENTATION MERGED FROM DELETED .MD FILES)

---
# 💬 Chatbot UI & Integration Guide

This section consolidates all documentation for the Chatbot UI, setup, customization, enhancements, demo, and reset/scrollbar update.

## 1. Chatbot UI Overview

- Modern, animated chatbot interface built with React and TailwindCSS
- Responsive design, quick suggestions, and attractive gradients
- Ready for future integration with n8n (helper file included)

## 2. Setup Instructions

**Component Location:** `src/components/ui/Chatbot.jsx`

**Integration:**
- Import and add `<Chatbot />` to your main layout (e.g., `MainLayout.jsx`)
- Uses Lucide React for icons and TailwindCSS for styling

**n8n Integration (Planned):**
- Helper file: `src/lib/n8n.js` (for future connection to n8n workflows)

## 3. Customization Guide

- **Colors & Gradients:** Edit Tailwind classes in `Chatbot.jsx` for custom gradients
- **Quick Suggestions:** Update the `quickSuggestions` array for new prompts
- **Animations:** Tailwind animation classes can be extended in `tailwind.config.js`
- **Icons:** Uses Lucide React; swap icons as needed
- **Positioning:** Default is bottom-right, but can be changed via CSS

## 4. UI Enhancements

- Animated gradient background for chat window
- Smooth transitions for opening/closing
- Attractive send button and input field
- Quick suggestion buttons for fast replies
- Responsive layout for mobile and desktop

## 5. Demo Guide

**To demo the chatbot:**
1. Open the app and click the chatbot icon (bottom-right)
2. Type a message or select a quick suggestion
3. Observe animated responses and UI transitions
4. Close the chat to reset conversation

## 6. Reset & Scrollbar Update

- **Reset on Close:** Chat history and input are cleared when the chat is closed
- **Scrollbar Hidden:** Custom CSS hides scrollbars in the chat window and globally (see `index.css`)

## 7. Troubleshooting

- If the chatbot UI does not appear, ensure it is imported and rendered in your layout
- For scrollbar issues, verify that global styles in `index.css` are applied
- For future n8n integration, see `src/lib/n8n.js` for helper functions

---
[//]: # (END OF MERGED CHATBOT DOCUMENTATION)

Contributions welcome!│ Creates User    │

└────┬────────────┘

1. Fork the repository     │

2. Create feature branch: `git checkout -b feature/name`     ▼

3. Commit changes: `git commit -m 'Add feature'`┌─────────────────┐

4. Push to branch: `git push origin feature/name`│ Database Trigger│

5. Open Pull Request│ Creates Profile │

└────┬────────────┘

---     │

     ▼

## 📝 License┌─────────────────┐

│ Auto Login      │

MIT License - see LICENSE file for details│ JWT Token       │

└─────────────────┘

---```



## 📧 Contact### Protected Routes



**Project Maintainer:** Talal Ahmed  Routes are protected using the `ProtectedRoute` component:

**GitHub:** [@TalalAhmed31](https://github.com/TalalAhmed31)  

**Repository:** [inventory_managment](https://github.com/TalalAhmed31/inventory_managment)```javascript

// Protected routes require authentication

---<Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>

  <Route path="dashboard" element={<Dashboard />} />

## 🎯 Roadmap  <Route path="products" element={<Products />} />

  <Route path="sales" element={<Sales />} />

### Upcoming Features  <Route path="purchases" element={<Purchases />} />

- [ ] Multi-warehouse support  <Route path="reports" element={<Reports />} />

- [ ] Barcode scanning  <Route path="users" element={<Users />} /> {/* Admin only */}

- [ ] Email notifications</Route>

- [ ] Mobile app (React Native)```

- [ ] Advanced analytics

- [ ] Batch operations### Role-Based Access

- [ ] Invoice generation

| Feature | Admin | Manager | Staff |

---|---------|-------|---------|-------|

| Dashboard | ✅ | ✅ | ✅ |

## 🙏 Acknowledgments| Products (View) | ✅ | ✅ | ✅ |

| Products (Add/Edit) | ✅ | ✅ | ❌ |

- **Supabase** - Backend platform| Products (Delete) | ✅ | ❌ | ❌ |

- **React** - UI library| Sales | ✅ | ✅ | ✅ |

- **TailwindCSS** - CSS framework| Purchases | ✅ | ✅ | ✅ |

- **Vite** - Build tool| Reports | ✅ | ✅ | ✅ |

- **Recharts** - Chart library| Users Management | ✅ | ❌ | ❌ |

- **Lucide** - Icon library| User Tab Visible | ✅ | ❌ | ❌ |



------



**Built with ❤️ by Talal Ahmed**## 📡 API Reference



**Last Updated:** October 5, 2025### Authentication API



---```javascript

import { auth } from './src/lib/supabase'

## Quick Commands

// Sign Up

```bashconst { data, error } = await auth.signUp(email, password, fullName)

# Install dependencies

npm install// Sign In

const { data, error } = await auth.signIn(email, password)

# Run development server

npm run dev// Sign Out

const { error } = await auth.signOut()

# Build for production

npm run build// Get Current User

const { data, error } = await auth.getCurrentUser()

# Preview production build```

npm run preview

### Database Operations

# Deploy edge functions

supabase functions deploy export-report```javascript

import { supabase } from './src/lib/supabase'

# Check function logs

supabase functions logs export-report// Fetch all products

```const { data, error } = await supabase

  .from('products')

---  .select('*')

  .eq('status', 'active')

**⭐ Star this repo if you find it helpful!**  .order('name')


// Add new product
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Product Name',
    sku: 'SKU001',
    category: 'Electronics',
    price: 99.99,
    cost: 50.00,
    quantity: 100
  })

// Update product
const { data, error } = await supabase
  .from('products')
  .update({ quantity: 150 })
  .eq('id', productId)

// Delete product
const { data, error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId)
```

### Realtime Subscriptions

```javascript
// Subscribe to product changes
const subscription = supabase
  .channel('products-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'products' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Unsubscribe
subscription.unsubscribe()
```

---

## ⚡ Edge Functions

### 1. record-sale
Records a sale transaction and updates inventory.

**Endpoint:** `/functions/v1/record-sale`

**Request:**
```json
{
  "product_id": "uuid",
  "quantity": 5,
  "unit_price": 99.99,
  "customer_name": "John Doe",
  "payment_method": "cash"
}
```

**Response:**
```json
{
  "success": true,
  "sale": { "id": "uuid", "total_price": 499.95 },
  "updated_stock": 45
}
```

### 2. record-purchase
Records a purchase order and updates inventory.

**Endpoint:** `/functions/v1/record-purchase`

**Request:**
```json
{
  "product_id": "uuid",
  "quantity": 50,
  "unit_cost": 45.00,
  "supplier_name": "Supplier Inc",
  "status": "completed"
}
```

### 3. generate-report
Generates custom reports based on criteria.

**Endpoint:** `/functions/v1/generate-report`

**Request:**
```json
{
  "report_type": "sales",
  "date_from": "2025-01-01",
  "date_to": "2025-01-31",
  "category": "Electronics"
}
```

### 4. manage-user
Admin function for user management operations.

**Endpoint:** `/functions/v1/manage-user`

---

## 🚢 Deployment

### Build for Production

```bash
# Build the project
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables

Create `.env` file (don't commit this):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Update `src/lib/supabase.js`:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

---

## 📖 Usage Guide

### For Admin Users

1. **Login** as admin
2. **Add Users** via Users page
3. **Create Products** via Products page
4. **Record Sales** when items are sold
5. **Record Purchases** when restocking
6. **View Reports** for analytics
7. **Manage Users** - edit roles, toggle status

### For Manager Users

1. **Login** with manager credentials
2. **Manage Products** - add, edit (not delete)
3. **Record Sales and Purchases**
4. **View Reports**
5. **Monitor Dashboard** statistics

### For Staff Users

1. **Login** with staff credentials
2. **View Products** (read-only)
3. **Record Sales and Purchases**
4. **View Dashboard** statistics

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "infinite recursion detected in policy"
**Problem:** RLS policy causing recursion  
**Solution:** Run the RLS fix SQL from Step 3 in Getting Started

#### 2. "Failed to load users"
**Problem:** RLS policies not set correctly  
**Solution:** Ensure you ran all migrations and the RLS fix

#### 3. "Authentication failed"
**Problem:** Wrong credentials or Supabase config  
**Solution:** Check email/password and verify supabase.js config

#### 4. Users tab not showing
**Problem:** User is not admin  
**Solution:** Update user role to 'admin' in database

#### 5. Cannot create products
**Problem:** User lacks permissions  
**Solution:** Ensure user role is 'admin' or 'manager'

### Debug Mode

Enable console logging in components to debug:

```javascript
// Add this to see API responses
console.log('API Response:', data)
console.log('Error:', error)
```

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to Logs → Edge Functions
3. Check for errors in function execution

---

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint -- --fix
```

---

## 🔧 Configuration Files

### vite.config.js
Vite build configuration

### tailwind.config.js
TailwindCSS styling configuration

### eslint.config.js
ESLint code quality rules

### postcss.config.js
PostCSS plugin configuration

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👥 Contributors

- **Talal Ahmed** - Initial work - [TalalAhmed31](https://github.com/TalalAhmed31)
- **Arhum Javaid** - Testing & Feedback

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Supabase for the backend infrastructure
- TailwindCSS for the styling system
- Lucide React for beautiful icons
- Recharts for data visualization

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Email: [your-email@example.com]
- Documentation: Check this README

---

## 🎯 Roadmap

### Planned Features
- [ ] Export reports to PDF/Excel/CSV
- [ ] Email notifications for low stock
- [ ] Barcode scanning support
- [ ] Multi-warehouse support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Batch product import/export
- [ ] Supplier management portal
- [ ] Invoice generation
- [ ] Payment integration

---

## 📊 Project Statistics

- **Lines of Code:** ~8,000+
- **Components:** 15+
- **Pages:** 8
- **Database Tables:** 5
- **Database Views:** 7
- **Edge Functions:** 4
- **Migrations:** 6

---

**Built with ❤️ using React, Supabase, and TailwindCSS**

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
#   I n v e n t o r y _ m a n a g e m e n t _ s y s t e m 
 
 