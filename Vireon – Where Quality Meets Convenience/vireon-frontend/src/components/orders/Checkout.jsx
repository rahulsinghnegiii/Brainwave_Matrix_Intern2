import { useEffect } from 'react';
import { FiCheck, FiTruck, FiCreditCard, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AddressForm from './AddressForm';
import PaymentForm from './PaymentForm';
import OrderSummary from './OrderSummary';
import useCheckout from '../../hooks/useCheckout';
import EmptyCart from '../cart/EmptyCart';

const steps = [
  { id: 'shipping', name: 'Shipping', icon: FiTruck },
  { id: 'payment', name: 'Payment', icon: FiCreditCard },
  { id: 'review', name: 'Review', icon: FiCheckCircle },
];

const Checkout = () => {
  const {
    currentStep,
    shippingAddress,
    billingAddress,
    paymentDetails,
    isProcessing,
    error,
    orderComplete,
    cart,
    subtotal,
    shipping,
    tax,
    total,
    handleShippingSubmit,
    handlePaymentSubmit,
    handlePlaceOrder,
  } = useCheckout();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && !orderComplete) {
      // Consider adding a redirect here
    }
  }, [cart.items.length, orderComplete]);

  if (cart.items.length === 0 && !orderComplete) {
    return <EmptyCart message="Your cart is empty. Add some items before checkout." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Checkout Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li
              key={step.id}
              className={`${
                stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
              } relative`}
            >
              <div className="flex items-center">
                <div
                  className={`${
                    currentStep === step.id
                      ? 'border-indigo-600 bg-indigo-600'
                      : currentStep === steps[stepIdx + 1]?.id ||
                        currentStep === steps[stepIdx + 2]?.id
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300 bg-white'
                  } relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2`}
                >
                  {currentStep === step.id ? (
                    <step.icon className="h-5 w-5 text-white" />
                  ) : currentStep === steps[stepIdx + 1]?.id ||
                    currentStep === steps[stepIdx + 2]?.id ? (
                    <FiCheck className="h-5 w-5 text-white" />
                  ) : (
                    <step.icon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className={`${
                      currentStep === steps[stepIdx + 1]?.id ||
                      currentStep === steps[stepIdx + 2]?.id
                        ? 'bg-indigo-600'
                        : 'bg-gray-300'
                    } absolute top-4 left-8 -ml-px h-0.5 w-full sm:w-20`}
                  />
                )}
              </div>
              <div className="mt-2">
                <span className="text-xs font-medium text-gray-900">
                  {step.name}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <FiAlertCircle className="h-6 w-6 text-red-500 mr-4" />
              </div>
              <div>
                <p className="font-bold">Payment Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10">
        <AnimatePresence mode="wait">
          {currentStep === 'shipping' && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
              <div className="mt-6">
                <AddressForm type="shipping" onSubmit={handleShippingSubmit} />
              </div>
            </motion.div>
          )}

          {currentStep === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
              <div className="mt-6">
                <PaymentForm onSubmit={handlePaymentSubmit} />
              </div>
            </motion.div>
          )}

          {currentStep === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-medium text-gray-900">Order Review</h2>
              <div className="mt-6 space-y-8">
                {/* Order Summary */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">
                    Order Summary
                  </h3>
                  <OrderSummary
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    total={total}
                  />
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Shipping Address */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-base font-medium text-gray-900 mb-4">
                      Shipping Address
                    </h3>
                    <address className="text-sm text-gray-600 not-italic">
                      {shippingAddress.fullName}<br />
                      {shippingAddress.address1}<br />
                      {shippingAddress.address2 && <>{shippingAddress.address2}<br /></>}
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                      {shippingAddress.country}
                    </address>
                  </div>

                  {/* Billing Address */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-base font-medium text-gray-900 mb-4">
                      Billing Address
                    </h3>
                    <address className="text-sm text-gray-600 not-italic">
                      {billingAddress.fullName}<br />
                      {billingAddress.address1}<br />
                      {billingAddress.address2 && <>{billingAddress.address2}<br /></>}
                      {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}<br />
                      {billingAddress.country}
                    </address>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">
                    Payment Information
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p><strong>Method:</strong> {
                      paymentDetails.paymentMethod === 'credit-card' ? 'Credit Card' :
                      paymentDetails.paymentMethod === 'paypal' ? 'PayPal' :
                      paymentDetails.paymentMethod === 'apple-pay' ? 'Apple Pay' :
                      paymentDetails.paymentMethod === 'google-pay' ? 'Google Pay' : 
                      'Unknown'
                    }</p>
                    
                    {paymentDetails.paymentMethod === 'credit-card' && (
                      <>
                        <p className="mt-2"><strong>Card Holder:</strong> {paymentDetails.nameOnCard}</p>
                        <p><strong>Card Number:</strong> •••• •••• •••• {paymentDetails.cardNumber.slice(-4)}</p>
                        <p><strong>Expiration:</strong> {paymentDetails.expirationDate}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Place Order'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout; 