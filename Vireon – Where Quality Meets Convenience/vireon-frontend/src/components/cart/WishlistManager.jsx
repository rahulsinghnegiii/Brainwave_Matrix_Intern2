import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const WishlistManager = ({ items = [], onRemove, onMoveToCart }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
        <p className="mt-1 text-sm text-gray-500">
          Save items you want to buy later
        </p>
        <div className="mt-6">
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">My Wishlist</h2>
        <p className="mt-1 text-sm text-gray-500">
          {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
        </p>
      </div>

      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {items.map((product) => (
            <li key={product.id} className="px-4 py-6 sm:px-6">
              <div className="flex items-center">
                {/* Product Image */}
                <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                  <img
                    src={product.image || 'https://placehold.co/200x200'}
                    alt={product.name}
                    className="w-full h-full object-center object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 ml-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        <Link
                          to={`/products/${product.id}`}
                          className="hover:text-indigo-600"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Stock Status */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center space-x-4">
                    <button
                      onClick={() => onMoveToCart(product)}
                      disabled={product.stock === 0}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <FiShoppingCart className="-ml-0.5 mr-2 h-4 w-4" />
                      Move to Cart
                    </button>
                    <button
                      onClick={() => onRemove(product.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiTrash2 className="-ml-0.5 mr-2 h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions Footer */}
      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex justify-between">
          <Link
            to="/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Continue Shopping
          </Link>
          {items.length > 0 && (
            <button
              onClick={() => items.forEach(item => onMoveToCart(item))}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FiShoppingCart className="-ml-1 mr-2 h-5 w-5" />
              Move All to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistManager; 