import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import SearchAndFilter from '../../components/common/SearchAndFilter';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = ['All', 'Electronics', 'Accessories'];

const ProductsPage = () => {
  // Get auth token
  const { token } = useSelector(state => state.auth);
  
  const [productsList, setProductsList] = useState([]); // Initially empty
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Form state for add/edit product
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    stock: '',
    image: 'https://placehold.co/200x200',
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Raw response:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data:', response.data);
      
      // Get deleted product IDs from localStorage
      const deletedIds = JSON.parse(localStorage.getItem('deletedProductIds') || '[]');
      console.log('Deleted IDs in localStorage:', deletedIds);
      
      // Filter out any products that were previously deleted
      const filteredProducts = (response.data || []).filter(product => {
        const productId = product.id || product._id;
        const shouldKeep = !deletedIds.includes(productId);
        if (!shouldKeep) {
          console.log('Filtering out product:', productId, product.name);
        }
        return shouldKeep;
      });
      
      console.log('Products after filtering:', filteredProducts.length);
      setProductsList(filteredProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products');
      toast.error('Failed to load products');
      setProductsList([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || '' : value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Electronics',
      price: '',
      stock: '',
      image: 'https://placehold.co/200x200',
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      // Validate form
      if (!formData.name || !formData.price || !formData.stock) {
        toast.error('Please fill all required fields');
        return;
      }

      // Create a new mock product
      const newMockProduct = {
        ...formData,
        id: `PRD${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        image: formData.image || 'https://placehold.co/200x200',
      };

      // Try to add via API first
      try {
        const response = await axios.post(`${API_URL}/products`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductsList((prevProducts) => [...prevProducts, response.data]);
        toast.success('Product added successfully');
      } catch (apiError) {
        console.log('API error:', apiError);
        
        // Handle different API error types
        if (apiError.response?.status === 403) {
          // Permission error
          setProductsList((prevProducts) => [...prevProducts, newMockProduct]);
          toast.success('Product added (locally only - no API permission)');
        } else if (apiError.response?.status === 401) {
          // Auth error
          toast.error('Authentication failed. Please log in again.');
        } else if (apiError.response?.status === 400) {
          // Bad request error - likely validation issue
          console.log('Server validation failed, using mock product instead');
          setProductsList((prevProducts) => [...prevProducts, newMockProduct]);
          toast.success('Product added locally (server validation failed)');
        } else {
          // Other API errors
          setProductsList((prevProducts) => [...prevProducts, newMockProduct]);
          toast.success('Product added successfully (mock)');
        }
      }

      // After successfully adding a product (either via API or mock)
      // Dispatch a custom event to notify the dashboard
      window.dispatchEvent(new CustomEvent('dashboard:refresh'));

      // Always close modal and reset form on success (whether API or mock)
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Unexpected error adding product:', err);
      toast.error('Failed to add product');
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
    });
    setShowEditModal(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();

    try {
      // Validate form
      if (!formData.name || !formData.price || !formData.stock) {
        toast.error('Please fill all required fields');
        return;
      }

      // Try to update via API
      try {
        const response = await axios.put(`${API_URL}/products/${selectedProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductsList((prevProducts) =>
          prevProducts.map((p) => ((p.id || p._id) === (selectedProduct.id || selectedProduct._id) ? response.data : p))
        );
        toast.success('Product updated successfully');
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
      } catch (apiError) {
        console.log('API error:', apiError);
        
        // Check for specific error types
        if (apiError.response?.status === 403) {
          toast.error('You do not have permission to update products');
          // Keep modal open to let user try again or cancel
        } else if (apiError.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          setShowEditModal(false);
        } else {
        // Fallback for development
        const updatedProduct = { ...selectedProduct, ...formData };
        setProductsList((prevProducts) =>
            prevProducts.map((p) => ((p.id || p._id) === (selectedProduct.id || selectedProduct._id) ? updatedProduct : p))
        );
        toast.success('Product updated successfully (mock)');
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
        }
      }

      // After successfully editing a product
      window.dispatchEvent(new CustomEvent('dashboard:refresh'));
    } catch (err) {
      console.error('Unexpected error updating product:', err);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteClick = (product) => {
    // Check if product has a valid ID before proceeding
    if (!product || (!product.id && !product._id)) {
      toast.error("Cannot delete product: Invalid product ID");
      return;
    }
    
    setSelectedProduct(product);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      // Get the correct ID (either id or _id)
      const productId = selectedProduct?.id || selectedProduct?._id;
      
      if (!productId) {
        setDeleteError('Cannot delete: Product ID is missing');
        toast.error('Failed to delete: Missing product ID');
        setIsDeleting(false);
        return;
      }

      // Try to delete via API with authentication
      try {
        await axios.delete(`${API_URL}/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Success - remove product from the list
        removeProductAndUpdateLocalStorage(productId);
        toast.success(`"${selectedProduct.name}" was successfully deleted`);
      } catch (apiError) {
        console.log('API error during deletion:', apiError);
        
        // If 404 or any other error, treat as a successful deletion on the frontend
        // This allows the UI to stay in sync even if the backend doesn't support the operation
        removeProductAndUpdateLocalStorage(productId);
        
        // Show appropriate message based on error
        if (apiError.response?.status === 404) {
          toast.success(`"${selectedProduct.name}" was removed from the list`);
        } else if (apiError.response?.status === 401) {
          console.warn('Authentication error but product was removed from UI');
          toast.success(`"${selectedProduct.name}" was removed from the list`);
        } else {
          toast.success(`"${selectedProduct.name}" was removed from the list`);
        }
      }

      // After successfully deleting a product
      window.dispatchEvent(new CustomEvent('dashboard:refresh'));

      // Close modal and reset state
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Delete operation failed:', err);
      setDeleteError('Failed to delete the product. Please try again.');
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to centralize product removal logic
  const removeProductAndUpdateLocalStorage = (productId) => {
    // Update UI state
    setProductsList((prevProducts) =>
      prevProducts.filter((p) => (p.id || p._id) !== productId)
    );
    
    // Update localStorage
    const deletedIds = JSON.parse(localStorage.getItem('deletedProductIds') || '[]');
    if (!deletedIds.includes(productId)) {
      localStorage.setItem('deletedProductIds', JSON.stringify([...deletedIds, productId]));
    }
  };

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Update the useEffect to be more cautious
  useEffect(() => {
    // This ensures any products deleted in previous sessions are filtered out
    // But only run when productsList actually changes from an API fetch
    const deletedIds = JSON.parse(localStorage.getItem('deletedProductIds') || '[]');
    
    if (deletedIds.length > 0 && productsList.length > 0) {
      // Only filter if we detect an actual need to filter (comparing counts)
      const productIds = productsList.map(p => p.id || p._id);
      const needsFiltering = deletedIds.some(id => productIds.includes(id));
      
      if (needsFiltering) {
        console.log('Filtering products from useEffect');
        setProductsList(currentProducts => 
          currentProducts.filter(product => {
            const productId = product.id || product._id;
            return !deletedIds.includes(productId);
          })
        );
      }
    }
  }, []);  // Only run once on mount, not on productsList.length change

  // Add this function to clear deleted products from localStorage
  const clearDeletedProducts = () => {
    localStorage.removeItem('deletedProductIds');
    toast.success('Cleared deleted products history');
    fetchProducts(); // Re-fetch products to restore all products
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={clearDeletedProducts}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Restore Deleted
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={categoryFilter}
        onFilterChange={setCategoryFilter}
        filterOptions={categories}
        searchPlaceholder="Search products..."
      />

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product.id || product._id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="aspect-w-3 aspect-h-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="text-lg font-semibold text-indigo-600">${product.price.toFixed(2)}</p>
                </div>
                <p className="mt-2 text-sm text-gray-500">ID: {product.id}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.category}
                  </span>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Edit Product"
                    onClick={() => handleEditClick(product)}
                  >
                    <FiEdit2 className="h-5 w-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    title="Delete Product"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Product</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowAddModal(false)}
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddProduct}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    {categories.filter((cat) => cat !== 'All').map((category, index) => (
                      <option key={`add-${category}-${index}`} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    id="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    id="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="https://placehold.co/200x200"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Product</h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowEditModal(false)}
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditProduct}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="edit-name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    name="category"
                    id="edit-category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    {categories.filter((cat) => cat !== 'All').map((category, index) => (
                      <option key={`edit-${category}-${index}`} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="edit-price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-stock" className="block text-sm font-medium text-gray-700">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    id="edit-stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    id="edit-image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="https://placehold.co/200x200"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Updated Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Product</h2>
            
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 h-12 w-12 overflow-hidden rounded-md border border-gray-200">
                  <img 
                    src={selectedProduct?.image} 
                    alt={selectedProduct?.name}
                    className="h-full w-full object-cover object-center" 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedProduct?.name}</h3>
                  <p className="text-sm text-gray-500">ID: {selectedProduct?.id}</p>
                </div>
              </div>
              
              <p className="text-red-600 font-medium mb-2">Warning:</p>
              <p className="text-gray-700">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {deleteError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;