import { useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ProductImageGallery = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed || !imageRef.current) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    setZoomPosition({ x, y });
  };

  return (
    <div className="relative h-full">
      {/* Main Image */}
      <div 
        className="relative w-full h-96 sm:h-[500px] overflow-hidden rounded-lg bg-gray-100"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex items-center justify-center"
            onClick={handleZoomToggle}
            style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
          >
            <div 
              ref={imageRef}
              className="relative w-full h-full"
            >
              <img
                src={images[currentImageIndex]?.url || 'https://via.placeholder.com/500'}
                alt={images[currentImageIndex]?.alt || 'Product image'}
                className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : ''}`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                      }
                    : {}
                }
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 shadow-md hover:bg-opacity-100 focus:outline-none"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 shadow-md hover:bg-opacity-100 focus:outline-none"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setIsZoomed(false);
              }}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 focus:outline-none ${
                index === currentImageIndex ? 'border-indigo-600' : 'border-transparent'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt || `Product thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery; 