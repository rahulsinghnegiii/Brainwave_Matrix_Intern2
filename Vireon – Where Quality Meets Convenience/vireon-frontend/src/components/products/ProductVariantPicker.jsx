import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProductVariantPicker = ({ 
  variants, 
  initialColor, 
  initialSize, 
  onVariantChange 
}) => {
  const [selectedColor, setSelectedColor] = useState(initialColor || '');
  const [selectedSize, setSelectedSize] = useState(initialSize || '');
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  
  // Get unique color and size options
  useEffect(() => {
    if (!variants || variants.length === 0) return;
    
    const allColors = [...new Set(variants.map(v => v.color))];
    setAvailableColors(allColors);
    
    if (!selectedColor && allColors.length > 0) {
      setSelectedColor(allColors[0]);
    }
  }, [variants, selectedColor]);
  
  // Update available sizes based on selected color
  useEffect(() => {
    if (!variants || variants.length === 0 || !selectedColor) return;
    
    const sizesForColor = variants
      .filter(v => v.color === selectedColor)
      .map(v => v.size);
    
    setAvailableSizes(sizesForColor);
    
    // If current size is not available for this color, reset it
    if (selectedSize && !sizesForColor.includes(selectedSize)) {
      setSelectedSize(sizesForColor[0] || '');
    } else if (!selectedSize && sizesForColor.length > 0) {
      setSelectedSize(sizesForColor[0]);
    }
  }, [variants, selectedColor, selectedSize]);
  
  // Notify parent of variant changes
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const selectedVariant = variants.find(
        v => v.color === selectedColor && v.size === selectedSize
      );
      
      if (selectedVariant) {
        onVariantChange(selectedVariant);
      }
    }
  }, [selectedColor, selectedSize, variants, onVariantChange]);
  
  // Return early if no variants
  if (!variants || variants.length === 0) {
    return <div className="text-sm text-gray-500">No variants available</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Color selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">Color</h3>
        <div className="mt-3 flex space-x-2">
          {availableColors.map(color => {
            const isSelected = color === selectedColor;
            return (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`relative flex items-center justify-center rounded-full p-0.5 focus:outline-none ${
                  isSelected ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                }`}
              >
                <span
                  className="h-8 w-8 rounded-full border border-black border-opacity-10"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                {isSelected && (
                  <motion.span
                    layoutId="colorSelection"
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      boxShadow: `0 0 0 2px white, 0 0 0 4px rgb(99, 102, 241)` 
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        
        <p className="mt-2 text-sm text-gray-500">
          Selected: <span className="font-medium">{selectedColor}</span>
        </p>
      </div>
      
      {/* Size selection */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Size</h3>
          <a href="#size-guide" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Size guide
          </a>
        </div>
        
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {availableSizes.map(size => {
            const variant = variants.find(v => v.color === selectedColor && v.size === size);
            const isOutOfStock = variant ? variant.quantity <= 0 : true;
            const isSelected = size === selectedSize;
            
            return (
              <button
                key={size}
                type="button"
                onClick={() => !isOutOfStock && setSelectedSize(size)}
                disabled={isOutOfStock}
                className={`
                  group relative flex items-center justify-center rounded-md border py-2 px-3 text-sm font-medium focus:outline-none ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : isOutOfStock
                      ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                      : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span>{size}</span>
                
                {isOutOfStock && (
                  <span className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200">
                    <svg
                      className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      stroke="currentColor"
                    >
                      <line x1="0" y1="100" x2="100" y2="0" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper function to map color names to hex values
const getColorHex = (colorName) => {
  const colorMap = {
    'white': '#FFFFFF',
    'black': '#000000',
    'gray': '#808080',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'orange': '#FFA500',
    // Add more colors as needed
  };
  
  return colorMap[colorName.toLowerCase()] || '#CCCCCC';
};

export default ProductVariantPicker; 