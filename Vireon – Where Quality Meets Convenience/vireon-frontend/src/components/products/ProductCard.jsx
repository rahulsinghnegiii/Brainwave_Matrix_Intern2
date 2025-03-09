import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const {
    id,
    name,
    price,
    image,
    description,
    category,
    stock,
    rating = 4.5,
  } = product;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Product Image */}
      <div className="relative">
        <img
          src={image || 'https://placehold.co/300x300'}
          alt={name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 space-x-2">
          <button
            onClick={() => onAddToWishlist(product)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            title="Add to Wishlist"
          >
            <FiHeart className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">{category}</p>
          </div>
          <span className="text-lg font-bold text-indigo-600">
            ${price.toFixed(2)}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Stock Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
            </span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="ml-1 text-sm text-gray-600">{rating}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between space-x-2">
          <button
            onClick={() => onAddToCart(product)}
            disabled={stock === 0}
            className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              stock > 0
                ? 'text-white bg-indigo-600 hover:bg-indigo-700 border-transparent'
                : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
            }`}
          >
            <FiShoppingCart className="-ml-1 mr-2 h-5 w-5" />
            Add to Cart
          </button>
          
          <Link
            to={`/products/${id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiEye className="-ml-1 mr-2 h-5 w-5" />
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 