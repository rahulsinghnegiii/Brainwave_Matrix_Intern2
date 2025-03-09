import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';

const ShopHeader = ({ cartItemCount, toggleCart }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            EcoShop
          </Link>

          {/* Search Bar (only visible on larger screens) */}
          <div className="hidden md:block flex-grow mx-10">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-blue-600"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <Link to="/profile" className="p-2 text-gray-600 hover:text-blue-600">
                <UserIcon className="h-6 w-6" />
              </Link>
            ) : (
              <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-blue-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu and search */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
            
            <nav className="space-y-2">
              <Link to="/" className="block py-2 text-gray-700 hover:text-blue-600">Home</Link>
              <Link to="/shop" className="block py-2 text-gray-700 hover:text-blue-600">All Products</Link>
              <Link to="/categories" className="block py-2 text-gray-700 hover:text-blue-600">Categories</Link>
              <Link to="/deals" className="block py-2 text-gray-700 hover:text-blue-600">Deals</Link>
              {isAuthenticated && (
                <>
                  <Link to="/orders" className="block py-2 text-gray-700 hover:text-blue-600">My Orders</Link>
                  <Link to="/wishlist" className="block py-2 text-gray-700 hover:text-blue-600">Wishlist</Link>
                </>
              )}
            </nav>
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex py-3 border-t">
          <ul className="flex space-x-8">
            <li><Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link></li>
            <li><Link to="/shop" className="text-gray-700 hover:text-blue-600">All Products</Link></li>
            <li><Link to="/categories" className="text-gray-700 hover:text-blue-600">Categories</Link></li>
            <li><Link to="/deals" className="text-gray-700 hover:text-blue-600">Deals</Link></li>
            {isAuthenticated && (
              <>
                <li><Link to="/orders" className="text-gray-700 hover:text-blue-600">My Orders</Link></li>
                <li><Link to="/wishlist" className="text-gray-700 hover:text-blue-600">Wishlist</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default ShopHeader; 