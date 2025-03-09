import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import socketService from '../../services/socketService';

const StockIndicator = ({ productId, initialStock }) => {
  const [stock, setStock] = useState(initialStock);
  const [isLowStock, setIsLowStock] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [hasStockChanged, setHasStockChanged] = useState(false);
  
  // Get from Redux if available
  const productFromState = useSelector(state => 
    state.products.items.find(p => p.id === productId)
  );
  
  useEffect(() => {
    // Update local state if Redux state changes
    if (productFromState && productFromState.stock !== undefined) {
      if (stock !== productFromState.stock) {
        setHasStockChanged(true);
        setTimeout(() => setHasStockChanged(false), 2000);
      }
      setStock(productFromState.stock);
    }
  }, [productFromState, stock]);
  
  useEffect(() => {
    // Set low stock flag if less than 5 items available
    setIsLowStock(stock > 0 && stock < 5);
    setIsOutOfStock(stock === 0);
    
    // Listen for stock updates via socket
    socketService.socket?.on(`product_stock_update:${productId}`, (data) => {
      if (data.stock !== stock) {
        setHasStockChanged(true);
        setTimeout(() => setHasStockChanged(false), 2000);
        setStock(data.stock);
      }
    });
    
    return () => {
      socketService.socket?.off(`product_stock_update:${productId}`);
    };
  }, [productId, stock]);
  
  if (isOutOfStock) {
    return (
      <div className="flex items-center text-red-600 mt-2">
        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
        <span className={`text-sm font-medium ${hasStockChanged ? 'animate-pulse' : ''}`}>
          Out of stock
        </span>
      </div>
    );
  }
  
  if (isLowStock) {
    return (
      <div className="flex items-center text-amber-600 mt-2">
        <FiAlertTriangle className="mr-1.5 h-4 w-4" />
        <span className={`text-sm font-medium ${hasStockChanged ? 'animate-pulse' : ''}`}>
          Only {stock} left in stock
        </span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-green-600 mt-2">
      <FiCheckCircle className="mr-1.5 h-4 w-4" />
      <span className="text-sm font-medium">In stock</span>
    </div>
  );
};

export default StockIndicator; 