import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const API_BASE_URL = "http://localhost:5000/api";

function ProductsPage() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use refs to track initial mount and prevent double fetching
  const initialFetchDone = useRef(false);

  const fetchProducts = useCallback(async () => {
    // Skip fetch if not authenticated
    if (!isAuthenticated) return;
    
    // Skip redundant fetches on first render (React 18 StrictMode double renders)
    if (loading === false && initialFetchDone.current) return;
    
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
      setError(null);
      initialFetchDone.current = true;
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setFilteredProducts(products.filter(p => p.name.includes(filter)));
  }, [products, filter]);

  const deleteProduct = async (productId) => {
    if (!productId) {
      toast.error("Invalid product ID");
      return;
    }
    
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted successfully");
      // Update local state to avoid refetching
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error("API error during deletion:", err);
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleAddProduct = async (productData) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to add products");
      return null;
    }
    
    // Validate data
    if (!productData.name || !productData.price || !productData.category || !productData.stock) {
      toast.error("Please fill all required fields");
      return null;
    }
    
    try {
      const response = await api.post('/products', productData);
      toast.success("Product added successfully");
      
      // Update local state instead of refetching
      setProducts(prev => [...prev, response.data]);
      
      return response.data;
    } catch (err) {
      console.error("API error:", err);
      toast.error(err.response?.data?.message || "Failed to add product");
      return null;
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="products-container">
      <h1>Products</h1>
      
      <div className="products-list">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>${product.price}</p>
            <p>Category: {product.category}</p>
            <p>In Stock: {product.stock}</p>
            {product.image && (
              <img src={product.image} alt={product.name} className="product-image" />
            )}
            <button 
              onClick={() => {
                // Extra validation to ensure product._id exists
                if (product._id) {
                  deleteProduct(product._id);
                } else {
                  toast.error("Cannot delete product: Missing product ID");
                }
              }}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage; 