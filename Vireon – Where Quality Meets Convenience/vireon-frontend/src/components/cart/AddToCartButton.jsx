import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { addToCart } from '../../store/cartSlice';

const AddToCartButton = ({ productId, className = '', variant = 'primary' }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const dispatch = useDispatch();
  
  const { loading } = useSelector(state => state.cart);
  const product = useSelector(state => 
    state.products.items.find(p => p.id === productId)
  );
  
  // Reset isAdded status after delay
  useEffect(() => {
    let timeout;
    if (isAdded) {
      timeout = setTimeout(() => {
        setIsAdded(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isAdded]);
  
  const handleAddToCart = async () => {
    if (loading || isAdding) return;
    
    setIsAdding(true);
    
    try {
      await dispatch(addToCart({
        productId,
        quantity
      })).unwrap();
      
      setIsAdded(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };
  
  // Handle quantity change
  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // Button variants
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return 'py-3 px-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm';
      case 'secondary':
        return 'py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md';
      case 'icon':
        return 'p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white';
      default:
        return 'py-3 px-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm';
    }
  };
  
  return (
    <div className={`${className} flex items-center`}>
      {variant !== 'icon' && (
        <div className="flex items-center border rounded-md border-gray-300 mr-4">
          <button
            type="button"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || isAdding}
            className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-3 py-1 text-gray-700">{quantity}</span>
          <button
            type="button"
            onClick={incrementQuantity}
            disabled={product && quantity >= product.stock || isAdding}
            className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            +
          </button>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <motion.button
          key={isAdded ? 'added' : 'not-added'}
          type="button"
          onClick={handleAddToCart}
          disabled={loading || isAdding || isAdded || (product && product.stock === 0)}
          className={`${getButtonStyles()} flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 relative overflow-hidden`}
          whileTap={{ scale: 0.95 }}
        >
          {isAdding ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : isAdded ? (
            <span className="flex items-center">
              <FiCheck className="mr-2 h-5 w-5" />
              Added!
            </span>
          ) : (
            <span className="flex items-center">
              <FiShoppingCart className={variant !== 'icon' ? 'mr-2 h-5 w-5' : 'h-5 w-5'} />
              {variant !== 'icon' && 'Add to Cart'}
            </span>
          )}
          
          {isAdded && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-full bg-green-100 text-green-800 text-xs py-1 px-2 rounded"
            >
              Item added to your cart
            </motion.div>
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
};

export default AddToCartButton; 