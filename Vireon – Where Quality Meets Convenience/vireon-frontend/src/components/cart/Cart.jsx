import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import CartItem from './CartItem';

const Cart = ({ items = [], onUpdateQuantity, onRemove, onCheckout }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Calculate cart totals
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await onCheckout();
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start shopping to add items to your cart
        </p>
        <div className="mt-6">
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Continue Shopping
            <FiArrowRight className="ml-2 -mr-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
        <p className="mt-1 text-sm text-gray-500">
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {/* Cart Items */}
      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
        <div className="flow-root">
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Cart Summary */}
      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
        <div className="flow-root">
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Subtotal</dt>
              <dd className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Shipping</dt>
              <dd className="text-sm font-medium text-gray-900">
                {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Tax</dt>
              <dd className="text-sm font-medium text-gray-900">${tax.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-medium text-gray-900">Order total</dt>
              <dd className="text-base font-medium text-gray-900">${total.toFixed(2)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Continue Shopping
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart; 