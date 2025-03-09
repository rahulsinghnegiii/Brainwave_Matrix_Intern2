import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { addToWishlist, removeFromWishlist } from '../../store/wishlistSlice';

const WishlistToggle = ({ productId, className = '' }) => {
  const dispatch = useDispatch();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { items: wishlist, loading } = useSelector(state => state.wishlist);
  const isInWishlist = wishlist.some(item => item.id === productId);
  
  const handleToggleWishlist = async () => {
    if (loading || isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 600); // Allow animation to complete
    }
  };
  
  return (
    <button
      type="button"
      className={`relative ${className}`}
      onClick={handleToggleWishlist}
      disabled={loading || isAnimating}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isInWishlist ? 'in-wishlist' : 'not-in-wishlist'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative"
        >
          <FiHeart
            className={`h-6 w-6 ${
              isInWishlist
                ? 'fill-current text-red-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          />
          
          {isAnimating && !isInWishlist && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.5, 0], opacity: [1, 1, 0] }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <FiHeart className="h-6 w-6 fill-current text-red-500" />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {loading && (
        <span className="absolute -top-1 -right-1 h-3 w-3">
          <span className="animate-ping absolute h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
      )}
    </button>
  );
};

export default WishlistToggle; 