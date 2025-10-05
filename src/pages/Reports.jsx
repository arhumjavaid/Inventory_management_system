import { useState, useEffect } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import { supabase } from '../lib/supabase';

export default function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalUnitsSold: 0,
    lowStockCount: 0
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch Sales Report Data
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          products (name, category, price, cost)
        `)
        .gte('sold_at', `${dateRange.startDate}T00:00:00`)
        .lte('sold_at', `${dateRange.endDate}T23:59:59`)
        .order('sold_at', { ascending: false });

      if (salesError) throw salesError;

      // Process sales data for report
      const salesByProduct = {};
      let totalRevenue = 0;
      let totalProfit = 0;
      let totalUnits = 0;

      sales?.forEach(sale => {
        const productName = sale.products?.name || 'Unknown';
        const category = sale.products?.category || 'Uncategorized';
        const revenue = sale.total_price || 0;
        const cost = (sale.products?.cost || 0) * sale.quantity;
        const profit = revenue - cost;

        if (!salesByProduct[productName]) {
          salesByProduct[productName] = {
            product: productName,
            category: category,
            unitsSold: 0,
            revenue: 0,
            profit: 0,
            cost: 0
          };
        }

        salesByProduct[productName].unitsSold += sale.quantity;
        salesByProduct[productName].revenue += revenue;
        salesByProduct[productName].profit += profit;
        salesByProduct[productName].cost += cost;

        totalRevenue += revenue;
        totalProfit += profit;
        totalUnits += sale.quantity;
      });

      setSalesData(Object.values(salesByProduct));

      // Fetch Stock Report Data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (productsError) throw productsError;

      const stockReport = products?.map(product => ({
        product: product.name,
        category: product.category,
        currentStock: product.quantity,
        reorderLevel: product.low_stock_threshold,
        status: product.quantity <= product.low_stock_threshold ? 'Low' : 'Good',
        sku: product.sku
      })) || [];

      setStockData(stockReport);

      const lowStockCount = stockReport.filter(item => item.status === 'Low').length;

      // Fetch Purchase Report Data
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          *,
          products (name, category)
        `)
        .gte('purchased_at', `${dateRange.startDate}T00:00:00`)
        .lte('purchased_at', `${dateRange.endDate}T23:59:59`)
        .order('purchased_at', { ascending: false });

      if (purchasesError) throw purchasesError;

      const purchaseByProduct = {};
      purchases?.forEach(purchase => {
        const productName = purchase.products?.name || 'Unknown';
        const category = purchase.products?.category || 'Uncategorized';

        if (!purchaseByProduct[productName]) {
          purchaseByProduct[productName] = {
            product: productName,
            category: category,
            totalQuantity: 0,
            totalCost: 0,
            orderCount: 0
          };
        }

        purchaseByProduct[productName].totalQuantity += purchase.quantity;
        purchaseByProduct[productName].totalCost += purchase.total_cost;
        purchaseByProduct[productName].orderCount += 1;
      });

      setPurchaseData(Object.values(purchaseByProduct));

      // Update stats
      setStats({
        totalRevenue,
        totalProfit,
        totalUnitsSold: totalUnits,
        lowStockCount
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on category
  const getFilteredData = (data) => {
    if (categoryFilter === 'All') return data;
    return data.filter(item => item.category === categoryFilter);
  };

  // Get current report data
  const getCurrentReportData = () => {
    switch (reportType) {
      case 'sales':
        return getFilteredData(salesData);
      case 'stock':
        return getFilteredData(stockData);
      case 'purchase':
        return getFilteredData(purchaseData);
      case 'profit':
        return getFilteredData(salesData);
      default:
        return [];
    }
  };

  // Sales Report Columns
  const salesColumns = [
    { key: 'product', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'unitsSold', label: 'Units Sold' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'profit', label: 'Profit' },
  ];

  // Stock Report Columns
  const stockColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'product', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'currentStock', label: 'Current Stock' },
    { key: 'reorderLevel', label: 'Reorder Level' },
    { key: 'status', label: 'Status' },
  ];

  // Purchase Report Columns
  const purchaseColumns = [
    { key: 'product', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'totalQuantity', label: 'Total Quantity' },
    { key: 'orderCount', label: 'Orders' },
    { key: 'totalCost', label: 'Total Cost' },
  ];

  // Profit Report Columns (same as sales but with margin)
  const profitColumns = [
    { key: 'product', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'cost', label: 'Cost' },
    { key: 'profit', label: 'Profit' },
    { key: 'margin', label: 'Margin %' },
  ];

  // Format Sales Table Data
  const salesTableData = getCurrentReportData().map(item => ({
    product: <span className="font-medium">{item.product}</span>,
    category: item.category,
    unitsSold: <span className="font-semibold">{item.unitsSold}</span>,
    revenue: <span className="font-bold text-green-600">${item.revenue?.toFixed(2) || '0.00'}</span>,
    profit: <span className="font-bold text-blue-600">${item.profit?.toFixed(2) || '0.00'}</span>,
  }));

  // Format Stock Table Data
  const stockTableData = getCurrentReportData().map(item => ({
    sku: <span className="font-mono text-sm">{item.sku}</span>,
    product: <span className="font-medium">{item.product}</span>,
    category: item.category,
    currentStock: <span className="font-semibold">{item.currentStock}</span>,
    reorderLevel: item.reorderLevel,
    status: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        item.status === 'Low' 
          ? 'bg-orange-100 text-orange-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        {item.status}
      </span>
    ),
  }));

  // Format Purchase Table Data
  const purchaseTableData = getCurrentReportData().map(item => ({
    product: <span className="font-medium">{item.product}</span>,
    category: item.category,
    totalQuantity: <span className="font-semibold">{item.totalQuantity}</span>,
    orderCount: <span className="text-gray-600">{item.orderCount}</span>,
    totalCost: <span className="font-bold text-blue-600">${item.totalCost?.toFixed(2) || '0.00'}</span>,
  }));

  // Format Profit Analysis Table Data
  const profitTableData = getCurrentReportData().map(item => {
    const margin = item.revenue > 0 ? ((item.profit / item.revenue) * 100) : 0;
    return {
      product: <span className="font-medium">{item.product}</span>,
      category: item.category,
      revenue: <span className="font-bold text-green-600">${item.revenue?.toFixed(2) || '0.00'}</span>,
      cost: <span className="text-gray-600">${item.cost?.toFixed(2) || '0.00'}</span>,
      profit: <span className="font-bold text-blue-600">${item.profit?.toFixed(2) || '0.00'}</span>,
      margin: (
        <span className={`font-semibold ${margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
          {margin.toFixed(1)}%
        </span>
      ),
    };
  });

  // Calculate summary stats for filtered data (used in table footer)
  const filteredSalesData = getFilteredData(salesData);
  const totalRevenue = filteredSalesData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalProfit = filteredSalesData.reduce((sum, item) => sum + (item.profit || 0), 0);
  const totalUnitsSold = filteredSalesData.reduce((sum, item) => sum + (item.unitsSold || 0), 0);

  // Get table columns based on report type
  const getColumns = () => {
    switch (reportType) {
      case 'sales':
        return salesColumns;
      case 'stock':
        return stockColumns;
      case 'purchase':
        return purchaseColumns;
      case 'profit':
        return profitColumns;
      default:
        return salesColumns;
    }
  };

  // Get table data based on report type
  const getTableData = () => {
    switch (reportType) {
      case 'sales':
        return salesTableData;
      case 'stock':
        return stockTableData;
      case 'purchase':
        return purchaseTableData;
      case 'profit':
        return profitTableData;
      default:
        return salesTableData;
    }
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      setLoading(true);
      
      const data = getCurrentReportData();
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to export reports');
        return;
      }

      // Call edge function to generate export
      const { data: exportData, error } = await supabase.functions.invoke('export-report', {
        body: {
          reportType,
          format: format.toLowerCase(),
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          categoryFilter,
          data: data
        }
      });

      if (error) {
        console.error('Export error:', error);
        alert(`Failed to export: ${error.message}`);
        return;
      }

      // For CSV and Excel, create download link
      if (format === 'CSV' || format === 'Excel') {
        const blob = new Blob([exportData], { 
          type: format === 'CSV' ? 'text/csv' : 'application/vnd.ms-excel' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${dateRange.startDate}_to_${dateRange.endDate}.${format === 'CSV' ? 'csv' : 'xls'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } 
      // For PDF, open in new window to print/save
      else if (format === 'PDF') {
        const blob = new Blob([exportData], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        
        // Trigger print dialog after content loads
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };
        }
      }

    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600 text-sm mt-1">Generate and export detailed business reports</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                ${stats.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-green-600 mt-1">Selected period</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <FileText size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Profit</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                ${stats.totalProfit.toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 mt-1">Net profit</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Units Sold</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">
                {stats.totalUnitsSold}
              </p>
              <p className="text-xs text-purple-600 mt-1">Total items</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <FileText size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-800 mt-1">
                {stats.lowStockCount}
              </p>
              <p className="text-xs text-orange-600 mt-1">Need reorder</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-full">
              <FileText size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <div className="space-y-4">
          {/* Report Type Selection */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sales">Sales Report</option>
                <option value="stock">Stock Report</option>
                <option value="profit">Profit Analysis</option>
                <option value="purchase">Purchase Report</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Filter
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Clothing & Accessories">Clothing & Accessories</option>
                <option value="Sports & Outdoors">Sports & Outdoors</option>
                <option value="Books & Stationery">Books & Stationery</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                icon={Calendar}
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                icon={Calendar}
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => handleExport('PDF')}
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Export to PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExport('Excel')}
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Export to Excel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExport('CSV')}
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Export to CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {reportType === 'sales' && 'Sales Report'}
            {reportType === 'stock' && 'Stock Report'}
            {reportType === 'purchase' && 'Purchase Report'}
            {reportType === 'profit' && 'Profit Analysis'}
          </h2>
          <span className="text-sm text-gray-600">
            {dateRange.startDate} to {dateRange.endDate}
          </span>
        </div>

        {getTableData().length > 0 ? (
          <>
            <Table columns={getColumns()} data={getTableData()} />
            <div className="mt-4 text-sm text-gray-600">
              Showing {getTableData().length} {reportType === 'stock' ? 'products' : 'entries'}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm mt-1">
              {reportType === 'stock' 
                ? 'No products found' 
                : 'No transactions found for the selected period'}
            </p>
          </div>
        )}

        {/* Summary Footer */}
        {(reportType === 'sales' || reportType === 'profit') && totalUnitsSold > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total Units</p>
                <p className="text-xl font-bold text-gray-800">{totalUnitsSold}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className="text-xl font-bold text-blue-600">${totalProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
