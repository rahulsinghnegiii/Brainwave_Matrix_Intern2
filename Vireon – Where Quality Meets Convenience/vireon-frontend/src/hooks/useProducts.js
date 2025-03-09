import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import productService from '../services/productService';
import { setProducts, addProduct, updateProduct, deleteProduct } from '../store/productSlice';

export const useProducts = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Fetch all products
  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts,
    onSuccess: (data) => {
      dispatch(setProducts(data));
    }
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: (data) => {
      dispatch(addProduct(data));
      queryClient.invalidateQueries(['products']);
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (data) => {
      dispatch(updateProduct(data));
      queryClient.invalidateQueries(['products']);
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: (_, id) => {
      dispatch(deleteProduct(id));
      queryClient.invalidateQueries(['products']);
    }
  });

  // Get product by ID
  const getProduct = async (id) => {
    try {
      const product = await productService.getProductById(id);
      return product;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw error;
    }
  };

  // Get product reviews
  const getProductReviews = async (productId) => {
    try {
      const reviews = await productService.getProductReviews(productId);
      return reviews;
    } catch (error) {
      console.error(`Failed to fetch reviews for product ${productId}:`, error);
      throw error;
    }
  };

  // Add product review
  const addProductReview = async (productId, reviewData) => {
    try {
      const review = await productService.addProductReview(productId, reviewData);
      // Invalidate product reviews cache
      queryClient.invalidateQueries(['products', productId, 'reviews']);
      return review;
    } catch (error) {
      console.error('Failed to add review:', error);
      throw error;
    }
  };

  return {
    products,
    isLoading,
    error,
    refetch,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    getProduct,
    getProductReviews,
    addProductReview,
    isCreating: createProductMutation.isLoading,
    isUpdating: updateProductMutation.isLoading,
    isDeleting: deleteProductMutation.isLoading,
  };
};

export default useProducts; 