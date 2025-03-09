import React, { useState } from 'react';
import MultiRangeSlider from '../ui/MultiRangeSlider';

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing & Apparel' },
  { id: 'home', name: 'Home & Kitchen' },
  { id: 'beauty', name: 'Beauty & Personal Care' },
  { id: 'books', name: 'Books & Stationery' }
];

const ProductFilters = ({ filters, setFilters }) => {
  const [expanded, setExpanded] = useState({
    categories: true,
    price: true,
    brands: false,
    rating: false
  });

  const toggleSection = (section) => {
    setExpanded({ ...expanded, [section]: !expanded[section] });
  };

  const handlePriceChange = (min, max) => {
    setFilters({ ...filters, priceRange: [min, max] });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      {/* Categories Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer" 
          onClick={() => toggleSection('categories')}
        >
          <h3 className="font-medium text-gray-800">Categories</h3>
          <span>{expanded.categories ? '−' : '+'}</span>
        </div>
        
        {expanded.categories && (
          <div className="mt-2 space-y-1">
            {CATEGORIES.map(category => (
              <div key={category.id} className="flex items-center">
                <input
                  type="radio"
                  id={`category-${category.id}`}
                  name="category"
                  checked={filters.category === category.id}
                  onChange={() => setFilters({ ...filters, category: category.id })}
                  className="mr-2"
                />
                <label htmlFor={`category-${category.id}`} className="text-gray-700">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Price Range Section */}
      <div className="mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer" 
          onClick={() => toggleSection('price')}
        >
          <h3 className="font-medium text-gray-800">Price Range</h3>
          <span>{expanded.price ? '−' : '+'}</span>
        </div>
        
        {expanded.price && (
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
            <MultiRangeSlider
              min={0}
              max={1000}
              onChange={({ min, max }) => handlePriceChange(min, max)}
              initialMin={filters.priceRange[0]}
              initialMax={filters.priceRange[1]}
            />
          </div>
        )}
      </div>
      
      <button
        onClick={() => setFilters({
          category: 'all',
          priceRange: [0, 1000],
          sortBy: 'popularity'
        })}
        className="w-full py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default ProductFilters; 