import { useState, useEffect } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Alert from '../components/ui/Alert';
import { supabase } from '../lib/supabase';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    supplierName: '',
    supplierEmail: '',
    quantity: '',
    unitCost: '',
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch products and purchases
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch active products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch recent purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          *,
          products (name, sku),
          user_profiles (full_name)
        `)
        .order('purchased_at', { ascending: false })
        .limit(50);

      if (purchasesError) throw purchasesError;
      setPurchases(purchasesData || []);

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
    setPurchaseForm(prev => ({ ...prev, [name]: value }));

    // If product changes, update selected product
    if (name === 'productId') {
      const product = products.find(p => p.id === value);
      setSelectedProduct(product || null);
    }
  };

  // Calculate new stock level
  const getNewStock = () => {
    if (!selectedProduct || !purchaseForm.quantity) return null;
    return selectedProduct.quantity + parseInt(purchaseForm.quantity);
  };

  // Calculate total cost
  const getTotalCost = () => {
    if (!purchaseForm.quantity || !purchaseForm.unitCost) return 0;
    return (parseFloat(purchaseForm.unitCost) * parseInt(purchaseForm.quantity)).toFixed(2);
  };

  // Handle purchase submission
  const handleSubmitPurchase = async (e) => {
    e.preventDefault();

    // Validation
    if (!purchaseForm.productId || !purchaseForm.supplierName || !purchaseForm.quantity || !purchaseForm.unitCost) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    const quantity = parseInt(purchaseForm.quantity);
    const unitCost = parseFloat(purchaseForm.unitCost);
    
    if (quantity <= 0) {
      setAlert({ type: 'error', message: 'Quantity must be greater than 0' });
      return;
    }

    if (unitCost <= 0) {
      setAlert({ type: 'error', message: 'Unit cost must be greater than 0' });
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAlert({ type: 'error', message: 'You must be logged in to record purchases' });
        return;
      }

      // Create purchase record
      const purchaseData = {
        product_id: purchaseForm.productId,
        quantity: quantity,
        unit_cost: unitCost,
        total_cost: parseFloat(getTotalCost()),
        supplier_name: purchaseForm.supplierName,
        supplier_email: purchaseForm.supplierEmail || null,
        status: 'completed',
        purchased_by: user.id
      };

      const { error } = await supabase
        .from('purchases')
        .insert([purchaseData]);

      if (error) throw error;

      setAlert({ type: 'success', message: 'Purchase recorded successfully!' });
      
      // Reset form and refresh data
      setPurchaseForm({
        productId: '',
        supplierName: '',
        supplierEmail: '',
        quantity: '',
        unitCost: '',
      });
      setSelectedProduct(null);
      fetchData();

    } catch (error) {
      console.error('Error recording purchase:', error);
      setAlert({ type: 'error', message: error.message || 'Failed to record purchase' });
    }
  };

  // Table columns
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'product', label: 'Product' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unitCost', label: 'Unit Cost' },
    { key: 'total', label: 'Total Cost' },
  ];

  // Format table data
  const tableData = purchases.map(purchase => ({
    date: new Date(purchase.purchased_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    product: <span className="font-medium">{purchase.products?.name || 'N/A'}</span>,
    supplier: purchase.supplier_name,
    quantity: purchase.quantity,
    unitCost: <span className="text-gray-600">${purchase.unit_cost.toFixed(2)}</span>,
    total: <span className="font-bold text-blue-600">${purchase.total_cost.toFixed(2)}</span>,
  }));

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayPurchases = purchases.filter(p => {
    const purchaseDate = new Date(p.purchased_at).toISOString().split('T')[0];
    return purchaseDate === today;
  });
  const todayTotal = todayPurchases.reduce((sum, purchase) => sum + purchase.total_cost, 0);
  const totalPurchaseValue = purchases.reduce((sum, purchase) => sum + purchase.total_cost, 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading purchase data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Purchase Entry</h1>
        <p className="text-gray-600 text-sm mt-1">Record new purchases and manage stock replenishment</p>
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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Today's Purchases</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">{todayPurchases.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Today's Spending</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">${todayTotal.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Purchase Value</p>
              <p className="text-2xl font-bold text-green-800 mt-1">${totalPurchaseValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Purchase Entry Form */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} />
          Record New Purchase
        </h2>
        
        <form onSubmit={handleSubmitPurchase} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product *
              </label>
              <select
                name="productId"
                value={purchaseForm.productId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Current Stock: {product.quantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name *
              </label>
              <Input
                name="supplierName"
                type="text"
                placeholder="Enter supplier name"
                value={purchaseForm.supplierName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supplier Email (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Email (Optional)
              </label>
              <Input
                name="supplierEmail"
                type="email"
                placeholder="supplier@company.com"
                value={purchaseForm.supplierEmail}
                onChange={handleInputChange}
              />
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
                value={purchaseForm.quantity}
                onChange={handleInputChange}
              />
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost *
              </label>
              <Input
                name="unitCost"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={purchaseForm.unitCost}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Purchase Summary */}
          {selectedProduct && purchaseForm.quantity && purchaseForm.unitCost && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Current Stock</p>
                  <p className="font-bold text-lg text-gray-800">{selectedProduct.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-600">New Stock Level</p>
                  <p className="font-bold text-lg text-green-600">{getNewStock()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Cost</p>
                  <p className="font-bold text-lg text-blue-600">${getTotalCost()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full md:w-auto">
            Record Purchase
          </Button>
        </form>
      </Card>

      {/* Purchase History Table */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Purchase History</h2>
        {purchases.length > 0 ? (
          <>
            <Table columns={columns} data={tableData} />
            <div className="mt-4 text-sm text-gray-600">
              Showing last 50 purchases
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No purchases recorded yet</p>
            <p className="text-sm mt-1">Start by recording your first purchase above</p>
          </div>
        )}
      </Card>
    </div>
  );
}
