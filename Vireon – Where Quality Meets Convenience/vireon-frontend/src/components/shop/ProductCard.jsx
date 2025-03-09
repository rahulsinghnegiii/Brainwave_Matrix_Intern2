import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ product, onAddToCart }) => {
  const { id, name, price, image, rating, description, inStock } = product;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image || 'https://via.placeholder.com/300'} 
          alt={name}
          className="w-full h-full object-cover"
        />
        {!inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            New
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/product/${id}`} className="text-lg font-semibold text-gray-800 hover:text-blue-600">
            {name}
          </Link>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-sm ml-1">{rating || '4.5'}</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-2 line-clamp-2" title={description}>
          {description || 'No description available'}
        </p>
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-xl font-bold text-gray-900">${price.toFixed(2)}</span>
          <button
            onClick={onAddToCart}
            disabled={!inStock}
            className={`px-3 py-2 rounded-lg flex items-center text-sm font-medium ${
              inStock 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCartIcon className="h-4 w-4 mr-1" />
            {inStock ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 