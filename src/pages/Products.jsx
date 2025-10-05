import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Alert from '../components/ui/Alert';
import { supabase } from '../lib/supabase';

const categories = ['All', 'Electronics', 'Home & Garden', 'Clothing & Accessories', 'Sports & Outdoors', 'Books & Stationery'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    description: '',
    price: '',
    cost: '',
    quantity: '',
    low_stock_threshold: '',
    reorder_quantity: '',
    unit: 'unit',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('quantity', { ascending: true }); // Show lowest stock first

      if (error) throw error;
      
      // Sort to prioritize: Out of Stock → Low Stock → In Stock
      const sortedData = (data || []).sort((a, b) => {
        // Calculate stock status for each product
        const aStatus = a.quantity === 0 ? 0 : a.quantity <= a.low_stock_threshold ? 1 : 2;
        const bStatus = b.quantity === 0 ? 0 : b.quantity <= b.low_stock_threshold ? 1 : 2;
        
        // Sort by status first, then by quantity
        if (aStatus !== bStatus) {
          return aStatus - bStatus; // Out of stock (0) → Low stock (1) → In stock (2)
        }
        return a.quantity - b.quantity; // Within same status, show lowest quantity first
      });
      
      setProducts(sortedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAlert({ type: 'error', message: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open modal for adding new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', 
      sku: '', 
      category: 'Electronics', 
      description: '',
      price: '', 
      cost: '',
      quantity: '', 
      low_stock_threshold: '',
      reorder_quantity: '',
      unit: 'unit'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description || '',
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      low_stock_threshold: product.low_stock_threshold,
      reorder_quantity: product.reorder_quantity,
      unit: product.unit || 'unit'
    });
    setIsModalOpen(true);
  };

  // Save product (add or update)
  const handleSaveProduct = async () => {
    // Validation
    if (!formData.name || !formData.sku || !formData.price || !formData.quantity) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost) || 0,
        quantity: parseInt(formData.quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
        reorder_quantity: parseInt(formData.reorder_quantity) || 20,
        unit: formData.unit,
        status: 'active'
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        setAlert({ type: 'success', message: 'Product updated successfully!' });
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        setAlert({ type: 'success', message: 'Product added successfully!' });
      }

      setIsModalOpen(false);
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error saving product:', error);
      setAlert({ type: 'error', message: error.message || 'Failed to save product' });
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Soft delete by setting status to 'inactive'
        const { error } = await supabase
          .from('products')
          .update({ status: 'inactive' })
          .eq('id', productId);

        if (error) throw error;
        
        setAlert({ type: 'success', message: 'Product deleted successfully!' });
        fetchProducts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting product:', error);
        setAlert({ type: 'error', message: 'Failed to delete product' });
      }
    }
  };

  // Get stock status badge
  const getStockBadge = (stock, threshold) => {
    if (stock === 0) return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Out of Stock</span>;
    if (stock <= threshold) return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Low Stock</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">In Stock</span>;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Table columns
  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  // Format table data
  const tableData = filteredProducts.map(product => {
    const isOutOfStock = product.quantity === 0;
    const isLowStock = product.quantity > 0 && product.quantity <= product.low_stock_threshold;
    
    return {
      sku: <span className="font-mono text-sm">{product.sku}</span>,
      name: (
        <div className="flex items-center gap-2">
          {(isOutOfStock || isLowStock) && (
            <AlertTriangle 
              size={16} 
              className={isOutOfStock ? 'text-red-500' : 'text-orange-500'}
            />
          )}
          <span className="font-medium">{product.name}</span>
        </div>
      ),
      category: <span className="text-sm">{product.category}</span>,
      price: <span className="font-semibold text-green-600">${product.price.toFixed(2)}</span>,
      stock: (
        <span className={`font-medium ${
          isOutOfStock ? 'text-red-600' : 
          isLowStock ? 'text-orange-600' : 
          'text-gray-900'
        }`}>
          {product.quantity} {product.unit}
        </span>
      ),
      status: getStockBadge(product.quantity, product.low_stock_threshold),
      actions: (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditProduct(product)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit product"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete product"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your inventory and products</p>
        </div>
        <Button onClick={handleAddProduct} className="flex items-center gap-2">
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Low Stock Summary */}
      {(() => {
        const outOfStock = products.filter(p => p.quantity === 0).length;
        const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.low_stock_threshold).length;
        
        if (outOfStock > 0 || lowStock > 0) {
          return (
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <AlertTriangle size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      Stock Alert
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-medium">
                        {outOfStock + lowStock} items
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {outOfStock > 0 && (
                        <span className="text-red-600 font-medium">{outOfStock} out of stock</span>
                      )}
                      {outOfStock > 0 && lowStock > 0 && <span className="text-gray-400"> • </span>}
                      {lowStock > 0 && (
                        <span className="text-orange-600 font-medium">{lowStock} low stock</span>
                      )}
                      {' '}— Items are sorted by priority below
                    </p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => setCategoryFilter('All')}
                  className="text-sm"
                >
                  View All
                </Button>
              </div>
            </Card>
          );
        }
        return null;
      })()}

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Filter className="text-gray-400 mt-2" size={20} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        {filteredProducts.length > 0 ? (
          <>
            <Table columns={columns} data={tableData} />
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">
              {products.length === 0 
                ? 'Start by adding your first product' 
                : 'No products match your search criteria'}
            </p>
          </div>
        )}
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <Input
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <Input
                name="sku"
                placeholder="e.g., ELEC-001"
                value={formData.sku}
                onChange={handleInputChange}
                disabled={editingProduct !== null}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              placeholder="Product description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Electronics">Electronics</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Clothing & Accessories">Clothing & Accessories</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Books & Stationery">Books & Stationery</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <Input
                name="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <Input
                name="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.cost}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <Input
                name="quantity"
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unit">Unit</option>
                <option value="pair">Pair</option>
                <option value="pack">Pack</option>
                <option value="set">Set</option>
                <option value="can">Can</option>
                <option value="ream">Ream</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
              <Input
                name="low_stock_threshold"
                type="number"
                placeholder="10"
                value={formData.low_stock_threshold}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Quantity</label>
              <Input
                name="reorder_quantity"
                type="number"
                placeholder="20"
                value={formData.reorder_quantity}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSaveProduct} className="flex-1">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
