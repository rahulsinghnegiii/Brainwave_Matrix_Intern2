import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiFilter, FiChevronDown, FiMessageCircle, FiThumbsUp, FiFlag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProductReviews } from '../../store/reviewSlice';
import ReviewForm from './ReviewForm';

const ProductReviews = ({ productId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const dispatch = useDispatch();
  const reviews = useSelector(state => state.reviews.productReviews[productId] || []);
  const user = useSelector(state => state.auth.user);
  
  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchProductReviews({ productId, rating: filterRating, sortBy }))
      .unwrap()
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, productId, filterRating, sortBy]);
  
  const calculateAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  
  const handleRatingFilter = (rating) => {
    setFilterRating(rating === filterRating ? 0 : rating);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const filteredReviews = filterRating > 0 
    ? reviews.filter(review => review.rating === filterRating)
    : reviews;
    
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FiStar
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900 flex items-center">
          <FiMessageCircle className="mr-2 h-5 w-5" />
          Customer Reviews
          {reviews.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </h2>
        
        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="mt-3 sm:mt-0 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <ReviewForm productId={productId} onSubmitSuccess={() => setShowReviewForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">{calculateAverageRating()}</p>
              <div className="flex items-center">
                {renderStars(Math.round(calculateAverageRating()))}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <FiFilter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Filter by:</span>
              <div className="flex space-x-1">
                {[5, 4, 3, 2, 1].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`px-2 py-1 text-xs rounded ${
                      filterRating === rating 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rating} ★
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-reviews" className="text-sm text-gray-500">
              Sort by:
            </label>
            <select
              id="sort-reviews"
              value={sortBy}
              onChange={handleSortChange}
              className="text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="newest">Newest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {reviews.length === 0 
                ? 'No reviews yet. Be the first to leave a review!'
                : 'No reviews match your filter criteria.'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-gray-200 pb-6"
              >
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-4">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{review.title}</p>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>{review.userName}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  {review.verifiedPurchase && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-green-600">Verified Purchase</span>
                    </>
                  )}
                </div>
                
                <p className="text-gray-800 mb-4">{review.content}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <FiThumbsUp className="h-4 w-4 mr-1" />
                    Helpful ({review.helpfulVotes})
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <FiFlag className="h-4 w-4 mr-1" />
                    Report
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ProductReviews; 