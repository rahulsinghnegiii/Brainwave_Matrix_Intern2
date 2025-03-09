import { useState } from 'react';
import { FiCheck, FiTruck, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import AddressForm from './AddressForm';

const steps = [
  { id: 'shipping', name: 'Shipping', icon: FiTruck },
  { id: 'billing', name: 'Billing', icon: FiCreditCard },
  { id: 'review', name: 'Review', icon: FiCheckCircle },
];

const Checkout = ({ cart, onPlaceOrder }) => {
  const [currentStep, setCurrentStep] = useState('shipping');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate order summary
  const subtotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = (data) => {
    setShippingAddress(data);
    setCurrentStep('billing');
  };

  const handleBillingSubmit = (data) => {
    setBillingAddress(data);
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      await onPlaceOrder({
        items: cart.items,
        shippingAddress,
        billingAddress,
        totals: {
          subtotal,
          shipping,
          tax,
          total,
        },
      });
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

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

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 'shipping' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Address
            </h2>
            <AddressForm
              type="shipping"
              defaultValues={shippingAddress}
              onSubmit={handleShippingSubmit}
            />
          </div>
        )}

        {currentStep === 'billing' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Billing Address
            </h2>
            <AddressForm
              type="billing"
              defaultValues={billingAddress || shippingAddress}
              onSubmit={handleBillingSubmit}
            />
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">
              Review Your Order
            </h2>

            {/* Order Summary */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Order Summary
              </h3>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Shipping</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Tax</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${tax.toFixed(2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">
                    ${total.toFixed(2)}
                  </dd>
                </div>
              </dl>
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

            {/* Place Order Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout; 