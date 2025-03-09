import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiDollarSign, FiBox, FiTag, FiLayers, FiType } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addProduct, updateProduct } from '../../store/productSlice';
import { motion, AnimatePresence } from 'framer-motion';

const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const initialState = {
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    category: '',
    images: [],
    variants: []
  };
  
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const isEditing = !!product;
  
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        sku: product.sku || '',
        category: product.category || '',
        images: product.images || [],
        variants: product.variants || []
      });
    } else {
      setFormData(initialState);
    }
    
    setError(null);
  }, [product, isOpen]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || value : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isEditing) {
        await dispatch(updateProduct(formData)).unwrap();
      } else {
        await dispatch(addProduct(formData)).unwrap();
      }
      
      onSuccess();
      setFormData(initialState);
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderImagePreview = () => {
    if (formData.images && formData.images.length > 0) {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.images.map((image, index) => (
            <div key={index} className="relative w-20 h-20 rounded overflow-hidden border border-gray-200">
              <img 
                src={typeof image === 'string' ? image : image.url || URL.createObjectURL(image)} 
                alt={`Preview ${index}`} 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index)
                  }));
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
              >
                <FiX size={12} />
              </button>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={onClose}
            ></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                
                {error && (
                  <div className="mt-3 p-2 bg-red-50 text-red-800 text-sm rounded-md">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FiTag className="mr-1" /> Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FiType className="mr-1" /> Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 flex items-center">
                        <FiDollarSign className="mr-1" /> Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-gray-700 flex items-center">
                        <FiBox className="mr-1" /> Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        id="stock"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sku" className="block text-sm font-medium text-gray-700 flex items-center">
                        <FiTag className="mr-1" /> SKU
                      </label>
                      <input
                        type="text"
                        name="sku"
                        id="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 flex items-center">
                        <FiLayers className="mr-1" /> Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <FiUpload className="mr-1" /> Product Images
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                    {renderImagePreview()}
                  </div>
                
                  <div className="pt-2 border-t">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal; 