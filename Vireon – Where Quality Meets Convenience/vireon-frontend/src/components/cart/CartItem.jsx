import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiX, FiPlus, FiMinus, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { updateCartItem, removeFromCart } from '../../store/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [showOptions, setShowOptions] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    
    // Set local state immediately for optimistic UI update
    setLocalQuantity(newQuantity);
    setIsUpdating(true);
    
    try {
      // Dispatch action to update cart in Redux and backend
      await dispatch(updateCartItem({ 
        productId: item.product.id, 
        quantity: newQuantity 
      })).unwrap();
    } catch (error) {
      // Revert to previous quantity if update fails
      setLocalQuantity(item.quantity);
      console.error('Failed to update quantity:', error);
      // Display error toast (if you have a toast component)
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async () => {
    setIsRemoving(true);
    
    try {
      await dispatch(removeFromCart(item.product.id)).unwrap();
    } catch (error) {
      console.error('Failed to remove item:', error);
      setIsRemoving(false);
      // Display error toast
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex py-6 border-b border-gray-200 relative"
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {/* Product image */}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Product details */}
      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>
              <Link to={`/products/${item.product.id}`} className="hover:text-indigo-600">
                {item.product.name}
              </Link>
            </h3>
            <p className="ml-4">${(item.product.price * localQuantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{item.product.color}</p>
        </div>
        
        <div className="flex flex-1 items-end justify-between text-sm">
          {/* Quantity selector */}
          <div className="flex items-center border rounded-md border-gray-300">
            <button
              type="button"
              disabled={localQuantity <= 1 || isUpdating}
              onClick={() => handleQuantityChange(localQuantity - 1)}
              className="p-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
            >
              <FiMinus className="h-3 w-3" />
            </button>
            <span className="px-2 py-1 text-gray-700 text-center w-10">{localQuantity}</span>
            <button
              type="button"
              disabled={localQuantity >= 99 || isUpdating}
              onClick={() => handleQuantityChange(localQuantity + 1)}
              className="p-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
            >
              <FiPlus className="h-3 w-3" />
            </button>
          </div>
          
          {/* Remove button */}
          <AnimatePresence>
            {(showOptions || isUpdating || isRemoving) && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center"
              >
                {isUpdating ? (
                  <span className="text-gray-500 flex items-center">
                    <FiLoader className="animate-spin mr-1 h-4 w-4" />
                    Updating...
                  </span>
                ) : isRemoving ? (
                  <span className="text-gray-500 flex items-center">
                    <FiLoader className="animate-spin mr-1 h-4 w-4" />
                    Removing...
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemoveItem}
                    className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                  >
                    <FiX className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem; 