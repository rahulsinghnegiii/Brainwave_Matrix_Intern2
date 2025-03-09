import { FiExternalLink, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const LowStockProducts = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return <p className="text-gray-500 text-center py-4">No low stock products found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th scope="col" className="relative px-4 py-3">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {product.name}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.sku}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FiAlertTriangle className={`mr-1.5 h-4 w-4 ${product.stock <= 2 ? 'text-red-500' : 'text-amber-500'}`} />
                  <span className={`${product.stock <= 2 ? 'text-red-700' : 'text-amber-700'} font-medium`}>
                    {product.stock} left
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/admin/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900">
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

export default LowStockProducts; 