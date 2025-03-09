import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiFileText, FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import { motion } from 'framer-motion';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError('Could not load order details. Please try again later.');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Link to="/dashboard" className="text-sm font-medium text-red-600 hover:text-red-500">
                  Go to dashboard <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Order not found!</h1>
          <p className="mt-2 text-base text-gray-500">
            We couldn't find the order you're looking for.
          </p>
          <div className="mt-6">
            <Link to="/dashboard" className="text-base font-medium text-indigo-600 hover:text-indigo-500">
              Go to your dashboard<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <motion.div 
        className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-xl">
          <div className="flex items-center space-x-2">
            <FiCheckCircle className="h-8 w-8 text-green-500" />
            <h1 className="text-sm font-semibold uppercase tracking-wide text-green-600">
              Thank you!
            </h1>
          </div>
          <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Order Confirmed
          </p>
          <p className="mt-2 text-base text-gray-500">
            Your order #{order.id} has been placed and will be processed soon.
          </p>

          <dl className="mt-12 text-sm font-medium">
            <dt className="text-gray-900">Tracking number</dt>
            <dd className="text-indigo-600 mt-2">{order.trackingId || 'Will be available once shipped'}</dd>
          </dl>
        </div>

        <div className="mt-10 border-t border-gray-200">
          <h2 className="sr-only">Your order</h2>

          <h3 className="sr-only">Items</h3>
          {order.items.map((item) => (
            <div key={item.id} className="py-10 border-b border-gray-200 flex space-x-6">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="flex-none w-20 h-20 object-center object-cover bg-gray-100 rounded-lg sm:w-40 sm:h-40"
              />
              <div className="flex-auto flex flex-col">
                <div>
                  <h4 className="font-medium text-gray-900">
                    <Link to={`/products/${item.product.id}`}>
                      {item.product.name}
                    </Link>
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {item.product.description?.substring(0, 100)}
                    {item.product.description?.length > 100 ? '...' : ''}
                  </p>
                </div>
                <div className="mt-6 flex-1 flex items-end">
                  <dl className="flex text-sm divide-x divide-gray-200 space-x-4 sm:space-x-6">
                    <div className="flex">
                      <dt className="font-medium text-gray-900">Quantity</dt>
                      <dd className="ml-2 text-gray-700">{item.quantity}</dd>
                    </div>
                    <div className="pl-4 flex sm:pl-6">
                      <dt className="font-medium text-gray-900">Price</dt>
                      <dd className="ml-2 text-gray-700">${(item.product.price * item.quantity).toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          ))}

          <div className="sm:ml-40 sm:pl-6">
            <h3 className="sr-only">Your information</h3>

            <h4 className="sr-only">Addresses</h4>
            <dl className="grid grid-cols-2 gap-x-6 text-sm py-10">
              <div>
                <dt className="font-medium text-gray-900">Shipping address</dt>
                <dd className="mt-2 text-gray-700">
                  <address className="not-italic">
                    {order.shippingAddress.fullName}<br />
                    {order.shippingAddress.address1}<br />
                    {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br /></>}
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                    {order.shippingAddress.country}
                  </address>
                </dd>
              </div>

              <div>
                <dt className="font-medium text-gray-900">Payment information</dt>
                <dd className="mt-2 text-gray-700">
                  <div className="not-italic">
                    <p>{order.paymentDetails.method === 'credit-card' ? 'Credit Card' : order.paymentDetails.method}</p>
                    {order.paymentDetails.lastFour && (
                      <p>Ending with {order.paymentDetails.lastFour}</p>
                    )}
                  </div>
                </dd>
              </div>
            </dl>

            <h4 className="sr-only">Summary</h4>
            <dl className="space-y-6 border-t border-gray-200 text-sm pt-10">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">Subtotal</dt>
                <dd className="text-gray-700">${order.totals.subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex font-medium text-gray-900">
                  Shipping
                </dt>
                <dd className="text-gray-700">{order.totals.shipping === 0 ? 'Free' : `$${order.totals.shipping.toFixed(2)}`}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">Tax</dt>
                <dd className="text-gray-700">${order.totals.tax.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-900">Total</dt>
                <dd className="text-gray-900">${order.totals.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiArrowLeft className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Continue Shopping
          </Link>
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Order History
            <FiChevronRight className="ml-2 -mr-1 h-5 w-5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderConfirmationPage; 