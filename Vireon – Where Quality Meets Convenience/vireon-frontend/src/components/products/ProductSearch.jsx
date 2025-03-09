import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { searchProducts } from '../../store/productSlice';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash.debounce';

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef(null);
  const resultRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { searchResults, loading } = useSelector(state => state.products.search);
  
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useRef(
    debounce((searchTerm) => {
      if (searchTerm.trim().length >= 2) {
        dispatch(searchProducts(searchTerm));
        setIsSearching(true);
      }
    }, 300)
  ).current;
  
  // Handle input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length >= 2) {
      debouncedSearch(value);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };
  
  // Handle clearing the search
  const handleClearSearch = () => {
    setQuery('');
    setShowResults(false);
    inputRef.current?.focus();
  };
  
  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultRef.current && 
        !resultRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };
  
  // Handle selecting a result
  const handleSelectResult = (productId) => {
    navigate(`/products/${productId}`);
    setShowResults(false);
  };
  
  useEffect(() => {
    // Once results are loaded, update state
    if (loading === false) {
      setIsSearching(false);
    }
  }, [loading]);

  return (
    <div className="relative max-w-lg w-full mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            ref={inputRef}
            value={query}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search products..."
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FiX className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          )}
        </div>
      </form>
      
      <AnimatePresence>
        {showResults && (query.trim().length >= 2) && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 overflow-hidden"
          >
            {isSearching ? (
              <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No products found for "{query}"
              </div>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {searchResults.map(product => (
                  <li 
                    key={product.id}
                    onClick={() => handleSelectResult(product.id)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                View all results for "{query}"
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearch; 