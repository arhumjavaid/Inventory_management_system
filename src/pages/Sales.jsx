import { useState, useEffect } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Alert from '../components/ui/Alert';
import { supabase } from '../lib/supabase';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sale form state
  const [saleForm, setSaleForm] = useState({
    productId: '',
    quantity: '',
    customerName: '',
    customerEmail: '',
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch products and sales
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch active products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .gt('quantity', 0)
        .order('name');

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch recent sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          products (name, sku),
          user_profiles (full_name)
        `)
        .order('sold_at', { ascending: false })
        .limit(50);

      if (salesError) throw salesError;
      setSales(salesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSaleForm(prev => ({ ...prev, [name]: value }));

    // If product changes, update selected product
    if (name === 'productId') {
      const product = products.find(p => p.id === value);
      setSelectedProduct(product || null);
    }
  };

  // Calculate remaining stock
  const getRemainingStock = () => {
    if (!selectedProduct || !saleForm.quantity) return null;
    return selectedProduct.quantity - parseInt(saleForm.quantity);
  };

  // Calculate total
  const getTotal = () => {
    if (!selectedProduct || !saleForm.quantity) return 0;
    return (selectedProduct.price * parseInt(saleForm.quantity)).toFixed(2);
  };

  // Handle sale submission
  const handleSubmitSale = async (e) => {
    e.preventDefault();

    // Validation
    if (!saleForm.productId || !saleForm.quantity || !saleForm.customerName) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    const quantity = parseInt(saleForm.quantity);
    
    if (quantity <= 0) {
      setAlert({ type: 'error', message: 'Quantity must be greater than 0' });
      return;
    }

    if (quantity > selectedProduct.quantity) {
      setAlert({ type: 'error', message: 'Insufficient stock available' });
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAlert({ type: 'error', message: 'You must be logged in to record sales' });
        return;
      }

      // Create sale record (total_price is auto-calculated by database)
      const saleData = {
        product_id: saleForm.productId,
        quantity: quantity,
        unit_price: selectedProduct.price,
        customer_name: saleForm.customerName,
        customer_email: saleForm.customerEmail || null,
        sold_by: user.id
      };

      const { error } = await supabase
        .from('sales')
        .insert([saleData]);

      if (error) throw error;

      setAlert({ type: 'success', message: 'Sale recorded successfully!' });
      
      // Reset form and refresh data
      setSaleForm({ productId: '', quantity: '', customerName: '', customerEmail: '' });
      setSelectedProduct(null);
      fetchData();

    } catch (error) {
      console.error('Error recording sale:', error);
      setAlert({ type: 'error', message: error.message || 'Failed to record sale' });
    }
  };

  // Table columns
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'product', label: 'Product' },
    { key: 'customer', label: 'Customer' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'price', label: 'Unit Price' },
    { key: 'total', label: 'Total' },
  ];

  // Format table data
  const tableData = sales.map(sale => ({
    date: new Date(sale.sold_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    product: <span className="font-medium">{sale.products?.name || 'N/A'}</span>,
    customer: sale.customer_name,
    quantity: sale.quantity,
    price: <span className="text-gray-600">${sale.unit_price.toFixed(2)}</span>,
    total: <span className="font-bold text-green-600">${sale.total_price.toFixed(2)}</span>,
  }));

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.sold_at).toISOString().split('T')[0];
    return saleDate === today;
  });
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_price, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sales Entry</h1>
        <p className="text-gray-600 text-sm mt-1">Record new sales and view history</p>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Today's Sales</p>
              <p className="text-2xl font-bold text-green-800 mt-1">{todaySales.length}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <ShoppingCart size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Today's Revenue</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">${todayRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">{sales.length}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <ShoppingCart size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Entry Form */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} />
          Record New Sale
        </h2>
        
        <form onSubmit={handleSubmitSale} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product *
              </label>
              <select
                name="productId"
                value={saleForm.productId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price} (Stock: {product.quantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <Input
                name="quantity"
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={saleForm.quantity}
                onChange={handleInputChange}
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <Input
                name="customerName"
                type="text"
                placeholder="Enter customer name"
                value={saleForm.customerName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Email (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Email (Optional)
              </label>
              <Input
                name="customerEmail"
                type="email"
                placeholder="customer@email.com"
                value={saleForm.customerEmail}
                onChange={handleInputChange}
              />
            </div>
            <div></div>
          </div>

          {/* Sale Summary */}
          {selectedProduct && saleForm.quantity && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Unit Price</p>
                  <p className="font-bold text-lg text-gray-800">${selectedProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Remaining Stock</p>
                  <p className={`font-bold text-lg ${getRemainingStock() < 10 ? 'text-orange-600' : 'text-gray-800'}`}>
                    {getRemainingStock()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-bold text-lg text-green-600">${getTotal()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full md:w-auto">
            Record Sale
          </Button>
        </form>
      </Card>

      {/* Recent Sales Table */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Sales</h2>
        {sales.length > 0 ? (
          <>
            <Table columns={columns} data={tableData} />
            <div className="mt-4 text-sm text-gray-600">
              Showing last 50 sales
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No sales recorded yet</p>
            <p className="text-sm mt-1">Start by recording your first sale above</p>
          </div>
        )}
      </Card>
    </div>
  );
}
