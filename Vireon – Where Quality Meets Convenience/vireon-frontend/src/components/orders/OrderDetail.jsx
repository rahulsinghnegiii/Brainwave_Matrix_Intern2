import { FiPackage, FiMapPin, FiCreditCard, FiTruck } from 'react-icons/fi';
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const OrderDetail = ({ order }) => {
  if (!order) return null;

  const steps = [
    { id: 'pending', name: 'Order Placed', icon: FiPackage },
    { id: 'processing', name: 'Processing', icon: FiCreditCard },
    { id: 'shipped', name: 'Shipped', icon: FiTruck },
    { id: 'delivered', name: 'Delivered', icon: FiMapPin },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === order.status);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Order Header */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Order #{order.id}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Placed on {format(new Date(order.date), 'MMMM d, yyyy')}
            </p>
          </div>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              statusColors[order.status]
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Order Progress */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          {steps.map((step, stepIdx) => (
            <div key={step.id} className="relative flex items-center">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  stepIdx <= currentStepIndex
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <step.icon className="h-6 w-6" />
              </div>
              {stepIdx < steps.length - 1 && (
                <div
                  className={`h-0.5 w-full absolute left-full -translate-x-1/2 ${
                    stepIdx < currentStepIndex
                      ? 'bg-indigo-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                {step.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
        <h4 className="text-base font-medium text-gray-900 mb-4">Order Items</h4>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-0"
            >
              <div className="flex-shrink-0 w-16 h-16">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name}
                </p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-4 py-5 sm:px-6 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="text-gray-900">
              {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax</span>
            <span className="text-gray-900">${order.tax.toFixed(2)}</span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-medium text-gray-900">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">
              Shipping Address
            </h4>
            <address className="text-sm text-gray-500 not-italic">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.address1}<br />
              {order.shippingAddress.address2 && (
                <>{order.shippingAddress.address2}<br /></>
              )}
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </address>
          </div>
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">
              Billing Address
            </h4>
            <address className="text-sm text-gray-500 not-italic">
              {order.billingAddress.fullName}<br />
              {order.billingAddress.address1}<br />
              {order.billingAddress.address2 && (
                <>{order.billingAddress.address2}<br /></>
              )}
              {order.billingAddress.city}, {order.billingAddress.state}{' '}
              {order.billingAddress.zipCode}<br />
              {order.billingAddress.country}
            </address>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 