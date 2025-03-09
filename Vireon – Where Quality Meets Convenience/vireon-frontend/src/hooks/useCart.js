import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import cartService from '../services/cartService';
import { setCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../store/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Fetch cart
  const {
    data: cart,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    onSuccess: (data) => {
      dispatch(setCart(data));
    }
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartService.addToCart(productId, quantity),
    onSuccess: (data) => {
      dispatch(addToCart(data));
      queryClient.invalidateQueries(['cart']);
    }
  });

  // Update cart item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartService.updateCartItem(productId, quantity),
    onSuccess: (data) => {
      dispatch(updateCartItem(data));
      queryClient.invalidateQueries(['cart']);
    }
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: (productId) => cartService.removeFromCart(productId),
    onSuccess: (_, productId) => {
      dispatch(removeFromCart(productId));
      queryClient.invalidateQueries(['cart']);
    }
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      dispatch(clearCart());
      queryClient.invalidateQueries(['cart']);
    }
  });

  // Apply discount mutation
  const applyDiscountMutation = useMutation({
    mutationFn: cartService.applyDiscount,
    onSuccess: (data) => {
      // Update cart with new totals after discount
      dispatch(setCart(data));
      queryClient.invalidateQueries(['cart']);
    }
  });

  // Get cart summary
  const getCartSummary = async () => {
    try {
      const summary = await cartService.getCartSummary();
      return summary;
    } catch (error) {
      console.error('Failed to fetch cart summary:', error);
      throw error;
    }
  };

  return {
    cart,
    isLoading,
    error,
    refetch,
    addToCart: addToCartMutation.mutateAsync,
    updateCartItem: updateCartItemMutation.mutateAsync,
    removeFromCart: removeFromCartMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    applyDiscount: applyDiscountMutation.mutateAsync,
    getCartSummary,
    isAdding: addToCartMutation.isLoading,
    isUpdating: updateCartItemMutation.isLoading,
    isRemoving: removeFromCartMutation.isLoading,
    isClearing: clearCartMutation.isLoading,
    isApplyingDiscount: applyDiscountMutation.isLoading,
  };
};

export default useCart; 