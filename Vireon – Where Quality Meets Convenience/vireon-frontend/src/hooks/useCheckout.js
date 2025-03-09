import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../store/cartSlice';
import { orderService } from '../services/orderService';

const useCheckout = () => {
  const [currentStep, setCurrentStep] = useState('shipping');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const cart = useSelector(state => state.cart);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Calculate order summary
  const subtotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = (data) => {
    setShippingAddress(data);
    if (data.sameAsBilling) {
      setBillingAddress(data);
    }
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (data) => {
    setPaymentDetails(data);
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const orderData = {
        items: cart.items,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentDetails: {
          method: paymentDetails.paymentMethod,
          lastFour: paymentDetails.cardNumber ? paymentDetails.cardNumber.slice(-4) : null,
        },
        totals: {
          subtotal,
          shipping,
          tax,
          total,
        },
        userId: user?.id,
      };

      const response = await orderService.createOrder(orderData);
      setOrderId(response.id);
      setOrderComplete(true);
      dispatch(clearCart());
      
      // Redirect to order confirmation after a short delay
      setTimeout(() => {
        navigate(`/orders/confirmation/${response.id}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to place order:', error);
      setError(error.response?.data?.message || error.message || 'Failed to process your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCheckout = () => {
    setCurrentStep('shipping');
    setShippingAddress(null);
    setBillingAddress(null);
    setPaymentDetails(null);
    setError(null);
    setOrderComplete(false);
    setOrderId(null);
  };

  return {
    currentStep,
    shippingAddress,
    billingAddress,
    paymentDetails,
    isProcessing,
    error,
    orderComplete,
    orderId,
    cart,
    subtotal,
    shipping,
    tax,
    total,
    handleShippingSubmit,
    handlePaymentSubmit,
    handlePlaceOrder,
    resetCheckout,
  };
};

export default useCheckout; 