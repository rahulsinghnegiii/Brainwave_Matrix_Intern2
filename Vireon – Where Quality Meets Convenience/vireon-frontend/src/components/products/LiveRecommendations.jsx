import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiRefreshCw } from 'react-icons/fi';
import { fetchRecommendations } from '../../store/productSlice';

const LiveRecommendations = ({ productId, type = 'similar' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { recommendations, loading } = useSelector(state => state.products);
  
  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchRecommendations({ productId, type }))
      .unwrap()
      .finally(() => {
        setIsLoading(false);
      });
      
    // Poll for new recommendations every 5 minutes
    const interval = setInterval(() => {
      dispatch(fetchRecommendations({ productId, type, silent: true }));
    }, 300000);
    
    return () => clearInterval(interval);
  }, [dispatch, productId, type]);
  
  const getTitleByType = () => {
    switch (type) {
      case 'similar':
        return 'Similar Products';
      case 'frequently-bought-together':
        return 'Frequently Bought Together';
      case 'trending':
        return 'Trending Now';
      default:
        return 'Recommended Products';
    }
  };
  
  const getIconByType = () => {
    switch (type) {
      case 'similar':
        return null;
      case 'frequently-bought-together':
        return <FiUsers className="h-5 w-5" />;
      case 'trending':
        return <FiTrendingUp className="h-5 w-5" />;
      default:
        return null;
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="mt-8 mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-gray-900 flex items-center">
          {getIconByType()}{getIconByType() && <span className="ml-2">{getTitleByType()}</span>}
          {!getIconByType() && getTitleByType()}
        </h2>
        <button
          onClick={() => dispatch(fetchRecommendations({ productId, type }))}
          className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
          disabled={loading}
        >
          <FiRefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <div className="relative">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">No recommendations available</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {recommendations.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-gray-700">
                        <Link to={`/products/${product.id}`}>
                          <span aria-hidden="true" className="absolute inset-0" />
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveRecommendations; 