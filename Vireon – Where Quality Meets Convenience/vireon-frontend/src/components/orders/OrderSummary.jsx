import { FiTag } from 'react-icons/fi';
import { useState } from 'react';
import { cartService } from '../../services/cartService';

const OrderSummary = ({ subtotal, shipping, tax, total, allowDiscounts = true }) => {
  const [discount, setDiscount] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCode, setAppliedCode] = useState(null);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsApplying(true);
    setDiscountError(null);
    
    try {
      const result = await cartService.applyDiscount(discountCode);
      if (result.valid) {
        setDiscount(result.amount);
        setAppliedCode(discountCode);
      } else {
        setDiscountError(result.message || 'Invalid discount code');
      }
    } catch (error) {
      setDiscountError('Failed to apply discount code');
    } finally {
      setIsApplying(false);
    }
  };

  const finalTotal = total - discount;

  return (
    <div className="space-y-4">
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

        {/* Discount Section */}
        {allowDiscounts && (
          <div className="pt-4">
            {appliedCode ? (
              <div className="flex items-center justify-between text-green-600">
                <dt className="flex items-center text-sm">
                  <FiTag className="mr-2 h-4 w-4" />
                  Discount ({appliedCode})
                </dt>
                <dd className="text-sm font-medium">
                  -${discount.toFixed(2)}
                </dd>
              </div>
            ) : (
              <div className="space-y-2">
                <dt className="text-sm text-gray-600">Discount Code</dt>
                <div className="flex">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter code"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={isApplying || !discountCode.trim()}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  >
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {discountError && (
                  <p className="mt-1 text-sm text-red-600">{discountError}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <dt className="text-base font-medium text-gray-900">Total</dt>
          <dd className="text-base font-medium text-gray-900">
            ${finalTotal.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default OrderSummary; 