import { FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const RecentOrdersList = ({ orders = [] }) => {
  if (!orders || orders.length === 0) {
    return <p className="text-gray-500 text-center py-4">No recent orders found</p>;
  }

  // Function to determine status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="relative px-4 py-3">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {order.id}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(order.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.customer}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                ${order.amount.toFixed(2)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                  <FiExternalLink className="h-5 w-5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrdersList; 