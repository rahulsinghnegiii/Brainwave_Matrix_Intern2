import { useState, useEffect } from 'react';
import { FiHeart, FiShoppingCart, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WishlistPage = ({ onAddToCart, onRemoveFromWishlist }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wishlist data when component mounts
  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistItems(response.data);
      } catch (apiError) {
        console.log('Using mock data as API is not available:', apiError);
        // Fallback to mock data if API fails
        setWishlistItems([
          {
            id: 1,
            name: 'Wireless Earbuds',
            price: 129.99,
            image: 'https://placehold.co/300x300',
            description: 'High-quality wireless earbuds with noise cancellation',
            inStock: true,
          },
          {
            id: 2,
            name: 'Smart Watch',
            price: 199.99,
            image: 'https://placehold.co/300x300',
            description: 'Feature-rich smartwatch with health tracking',
            inStock: true,
          },
          {
            id: 3,
            name: 'Laptop Stand',
            price: 49.99,
            image: 'https://placehold.co/300x300',
            description: 'Ergonomic laptop stand for better posture',
            inStock: false,
          },
        ]);
      }
    } catch (err) {
      setError('Failed to load wishlist items');
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/cart`, { productId: item.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`${item.name} added to cart`);
      
      // Call the parent component's callback if provided
      onAddToCart?.(item);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add item to cart');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      // Optimistic UI update
      setWishlistItems((items) => items.filter((item) => item.id !== itemId));
      
      // Call API to remove from wishlist
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/wishlist/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Item removed from wishlist');
      
      // Call the parent component's callback if provided
      onRemoveFromWishlist?.(itemId);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Failed to remove item from wishlist');
      
      // Revert the optimistic update if the API call fails
      fetchWishlistItems();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error}
        </h3>
        <button
          onClick={fetchWishlistItems}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">My Wishlist</h1>
        <div className="flex items-center space-x-2">
          <FiHeart className="h-5 w-5 text-red-500" />
          <span className="text-gray-600">{wishlistItems.length} items</span>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <FiHeart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500">
            Start adding items you'd like to purchase later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                {!item.inStock && (
                  <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Out of Stock
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </span>
                  {item.inStock && (
                    <span className="text-green-600 text-sm">In Stock</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.inStock}
                    className={`flex-1 flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium ${
                      item.inStock
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <FiShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 border rounded-md"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;