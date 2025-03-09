import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/productSlice';
import ProductGrid from '../../components/shop/ProductGrid';
import ProductFilters from '../../components/shop/ProductFilters';
import ShopHeader from '../../components/shop/ShopHeader';
import ShopFooter from '../../components/shop/ShopFooter';
import ShoppingCart from '../../components/shop/ShoppingCart';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { addToCart, removeFromCart, updateCartItemQuantity } from '../../store/cartSlice';
import { toast } from 'react-toastify';

const ShopPage = () => {
  const dispatch = useDispatch();
  const { products, status, error } = useSelector(state => state.products);
  const { items: cartItems } = useSelector(state => state.cart);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'popularity'
  });
  const [showCart, setShowCart] = useState(false);
  
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);
  
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart!`);
  };
  
  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart(productId));
    toast.info("Item removed from cart");
  };
  
  const handleUpdateQuantity = (productId, quantity) => {
    dispatch(updateCartItemQuantity({ id: productId, quantity }));
  };
  
  const toggleCart = () => {
    setShowCart(!showCart);
  };
  
  const filteredProducts = products
    ? products
        .filter(product => filters.category === 'all' || product.category === filters.category)
        .filter(product => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1])
        .sort((a, b) => {
          if (filters.sortBy === 'price-low') return a.price - b.price;
          if (filters.sortBy === 'price-high') return b.price - a.price;
          if (filters.sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
          // Default: sort by popularity/rating
          return b.rating - a.rating;
        })
    : [];
  
  if (status === 'loading') return <LoadingSpinner />;
  
  if (status === 'failed') return <div className="text-center text-red-600 p-4">Error: {error}</div>;
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <ShopHeader cartItemCount={cartItems.length} toggleCart={toggleCart} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shop Our Products</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <ProductFilters 
              filters={filters} 
              setFilters={setFilters} 
            />
          </div>
          
          <div className="w-full md:w-3/4">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">{filteredProducts.length} products found</p>
              <div className="flex items-center">
                <label htmlFor="sortBy" className="mr-2">Sort By:</label>
                <select 
                  id="sortBy"
                  className="border rounded p-2"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
            
            <ProductGrid 
              products={filteredProducts} 
              onAddToCart={handleAddToCart} 
            />
          </div>
        </div>
      </div>
      
      <ShoppingCart 
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
      
      <ShopFooter />
    </div>
  );
};

export default ShopPage; 