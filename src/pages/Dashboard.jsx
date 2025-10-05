import { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, ShoppingCart } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    salesToday: 0,
    lowStockItems: 0,
    totalOrders: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      // Fetch all data in parallel for better performance
      const [
        productsResult,
        salesTodayResult,
        lowStockResult,
        salesCountResult,
        purchasesCountResult,
        salesTrendResult,
        purchasesTrendResult,
        categoryResult,
        recentProductsResult
      ] = await Promise.all([
        // Total products count
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        
        // Sales today
        supabase
          .from('sales')
          .select('total_price')
          .gte('sold_at', `${today}T00:00:00`)
          .lte('sold_at', `${today}T23:59:59`),
        
        // Low stock products
        supabase
          .from('products')
          .select('id, name, category, quantity, low_stock_threshold')
          .eq('status', 'active'),
        
        // Sales count
        supabase
          .from('sales')
          .select('*', { count: 'exact', head: true }),
        
        // Purchases count
        supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true }),
        
        // Sales trend (last 7 days) - fetch all at once
        supabase
          .from('sales')
          .select('sold_at, total_price')
          .gte('sold_at', `${sevenDaysAgoStr}T00:00:00`),
        
        // Purchases trend (last 7 days) - fetch all at once
        supabase
          .from('purchases')
          .select('purchased_at, total_cost')
          .gte('purchased_at', `${sevenDaysAgoStr}T00:00:00`),
        
        // Category distribution
        supabase
          .from('products')
          .select('category, quantity')
          .eq('status', 'active'),
        
        // Recent products
        supabase
          .from('products')
          .select('id, name, category, price, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Process results
      const salesToday = salesTodayResult.data?.reduce((sum, sale) => sum + (sale.total_price || 0), 0) || 0;
      
      const lowStockCount = lowStockResult.data?.filter(p => p.quantity <= p.low_stock_threshold).length || 0;
      
      // Set low stock products for the table
      const lowStock = lowStockResult.data
        ?.filter(p => p.quantity <= p.low_stock_threshold)
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          stock: product.quantity,
          reorderLevel: product.low_stock_threshold
        })) || [];
      setLowStockProducts(lowStock);

      const totalOrders = (salesCountResult.count || 0) + (purchasesCountResult.count || 0);

      setStats({
        totalProducts: productsResult.count || 0,
        salesToday: salesToday,
        lowStockItems: lowStockCount,
        totalOrders: totalOrders
      });

      // Process sales trend data
      processSalesTrend(salesTrendResult.data || [], purchasesTrendResult.data || []);

      // Process category data
      processCategoryData(categoryResult.data || []);

      // Process recent products
      const recent = recentProductsResult.data?.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        date: new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })) || [];
      setRecentProducts(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process sales trend data efficiently
  const processSalesTrend = (salesData, purchasesData) => {
    const last7Days = [];
    const today = new Date();
    
    // Group sales and purchases by date
    const salesByDate = {};
    const purchasesByDate = {};
    
    salesData.forEach(sale => {
      const date = new Date(sale.sold_at).toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + (sale.total_price || 0);
    });
    
    purchasesData.forEach(purchase => {
      const date = new Date(purchase.purchased_at).toISOString().split('T')[0];
      purchasesByDate[date] = (purchasesByDate[date] || 0) + (purchase.total_cost || 0);
    });
    
    // Build chart data for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      last7Days.push({
        month: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: Math.round(salesByDate[dateStr] || 0),
        purchases: Math.round(purchasesByDate[dateStr] || 0)
      });
    }
    
    setSalesData(last7Days);
  };

  // Process category data efficiently
  const processCategoryData = (products) => {
    const categoryMap = {};
    products.forEach(product => {
      if (categoryMap[product.category]) {
        categoryMap[product.category] += product.quantity;
      } else {
        categoryMap[product.category] = product.quantity;
      }
    });

    const chartData = Object.entries(categoryMap).map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value
    }));

    setCategoryData(chartData);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Products</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">{stats.totalProducts}</p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.totalProducts > 0 ? 'Active products' : 'No products yet'}
              </p>
            </div>
            <div className="p-4 bg-blue-200 rounded-full">
              <Package size={28} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Sales Today</p>
              <p className="text-3xl font-bold text-green-800 mt-2">
                ${stats.salesToday.toFixed(2)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stats.salesToday > 0 ? 'Today\'s revenue' : 'No sales yet'}
              </p>
            </div>
            <div className="p-4 bg-green-200 rounded-full">
              <TrendingUp size={28} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-800 mt-2">{stats.lowStockItems}</p>
              <p className="text-xs text-orange-600 mt-1">
                {stats.lowStockItems > 0 ? 'Need attention' : 'All good!'}
              </p>
            </div>
            <div className="p-4 bg-orange-200 rounded-full">
              <AlertTriangle size={28} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">{stats.totalOrders}</p>
              <p className="text-xs text-purple-600 mt-1">
                {stats.totalOrders > 0 ? 'Sales & purchases' : 'No orders yet'}
              </p>
            </div>
            <div className="p-4 bg-purple-200 rounded-full">
              <ShoppingCart size={28} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales & Purchases Trend (Last 7 Days)</h3>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} name="Sales" />
                <Line type="monotone" dataKey="purchases" stroke="#10B981" strokeWidth={2} name="Purchases" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No transaction data available
            </div>
          )}
        </Card>

        {/* Category Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" name="Stock Quantity" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Low Stock Alerts</h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
              {lowStockProducts.length} Items
            </span>
          </div>
          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">{product.stock}</p>
                    <p className="text-xs text-gray-500">Min: {product.reorderLevel}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle size={48} className="mx-auto mb-2 opacity-50" />
                <p>No low stock items</p>
                <p className="text-sm">All products are well stocked!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recently Added Products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recently Added</h3>
            <button 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => window.location.href = '/products'}
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentProducts.length > 0 ? (
              recentProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">${product.price}</p>
                    <p className="text-xs text-gray-500">{product.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-2 opacity-50" />
                <p>No products yet</p>
                <p className="text-sm">Start by adding your first product!</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
