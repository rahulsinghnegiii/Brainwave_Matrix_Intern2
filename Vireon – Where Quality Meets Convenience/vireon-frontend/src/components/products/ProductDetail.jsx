import { useState } from 'react';
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiStar } from 'react-icons/fi';

const ProductDetail = ({ product, onAddToCart, onAddToWishlist }) => {
  const [quantity, setQuantity] = useState(1);
  const {
    name,
    price,
    description,
    category,
    stock,
    rating = 4.5,
    reviews = [],
    images = [],
    specifications = [],
  } = product;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="p-6">
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img
              src={images[0] || 'https://placehold.co/600x600'}
              alt={name}
              className="w-full h-full object-center object-cover rounded-lg"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${name} view ${index + 2}`}
                  className="h-24 w-full object-cover rounded-lg cursor-pointer"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{name}</h1>
            <p className="text-sm text-gray-500 mb-4">{category}</p>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <FiStar
                    key={index}
                    className={`h-5 w-5 ${
                      index < Math.floor(rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                ({reviews.length} reviews)
              </span>
            </div>
            <p className="text-3xl font-bold text-indigo-600">${price.toFixed(2)}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">{description}</p>
          </div>

          {specifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Specifications</h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex">
                    <dt className="w-1/3 text-sm font-medium text-gray-500">{spec.name}</dt>
                    <dd className="w-2/3 text-sm text-gray-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-2 border rounded-md disabled:opacity-50"
              >
                <FiMinus className="h-4 w-4" />
              </button>
              <span className="text-gray-900 font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= stock}
                className="p-2 border rounded-md disabled:opacity-50"
              >
                <FiPlus className="h-4 w-4" />
              </button>
              <span className="ml-2 text-sm text-gray-500">
                {stock} units available
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => onAddToCart(product, quantity)}
              disabled={stock === 0}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <FiShoppingCart className="-ml-1 mr-3 h-5 w-5" />
              Add to Cart
            </button>
            <button
              onClick={() => onAddToWishlist(product)}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiHeart className="-ml-1 mr-3 h-5 w-5" />
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {review.author}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {review.date}
                  </span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 