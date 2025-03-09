import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { paymentService } from '../services/paymentService';
import { updateOrderStatus } from '../store/orderSlice';

const usePaymentStatus = (paymentId, initialStatus) => {
  const [status, setStatus] = useState(initialStatus || 'unknown');
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId) return;
    
    try {
      const result = await paymentService.verifyPayment(paymentId);
      setStatus(result.status);
      
      // If payment is completed (either succeeded or failed), stop polling
      if (['succeeded', 'requires_payment_method', 'canceled'].includes(result.status)) {
        setIsPolling(false);
        
        // Update the order status based on payment status
        if (result.orderId) {
          dispatch(updateOrderStatus({
            orderId: result.orderId,
            status: result.status === 'succeeded' ? 'paid' : 'payment_failed'
          }));
        }
      }
      
      return result.status;
    } catch (error) {
      console.error('Error checking payment status:', error);
      setError('Failed to check payment status');
      setIsPolling(false);
      return null;
    }
  }, [paymentId, dispatch]);

  // Start polling when paymentId changes
  useEffect(() => {
    if (!paymentId) return;
    
    setIsPolling(true);
    setError(null);
    
    const pollInterval = setInterval(async () => {
      if (isPolling) {
        const currentStatus = await checkPaymentStatus();
        if (!currentStatus || ['succeeded', 'requires_payment_method', 'canceled'].includes(currentStatus)) {
          clearInterval(pollInterval);
        }
      }
    }, 3000); // Poll every 3 seconds
    
    // Initial check
    checkPaymentStatus();
    
    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [paymentId, checkPaymentStatus, isPolling]);

  return { status, isPolling, error, checkPaymentStatus };
};

export default usePaymentStatus; 