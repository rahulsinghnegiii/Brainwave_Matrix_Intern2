import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity } = item;
  const {
    id,
    name,
    price,
    image,
    stock,
  } = product;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= stock) {
      onUpdateQuantity(product.id, newQuantity);
    }
  };

  const subtotal = price * quantity;

  return (
    <div className="flex items-center py-6 border-b border-gray-200 last:border-b-0">
      {/* Product Image */}
      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
        <img
          src={image || 'https://placehold.co/200x200'}
          alt={name}
          className="w-full h-full object-center object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 ml-6">
        <div className="flex justify-between">
          <div>
            <Link
              to={`/products/${id}`}
              className="text-lg font-medium text-gray-900 hover:text-indigo-600"
            >
              {name}
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              ${price.toFixed(2)} each
            </p>
          </div>
          <p className="text-lg font-medium text-gray-900">
            ${subtotal.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Quantity Controls */}
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="p-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
            >
              <FiMinus className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-gray-900 text-sm">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= stock}
              className="p-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(product.id)}
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            <span className="sr-only">Remove item</span>
            <FiTrash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Stock Warning */}
        {quantity >= stock && (
          <p className="mt-2 text-sm text-yellow-600">
            Maximum available quantity reached
          </p>
        )}
      </div>
    </div>
  );
};

export default CartItem; 