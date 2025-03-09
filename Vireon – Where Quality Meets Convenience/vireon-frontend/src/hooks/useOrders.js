import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import orderService from '../services/orderService';
import { setOrders, addOrder, updateOrderStatus, deleteOrder } from '../store/orderSlice';

export const useOrders = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Fetch all orders
  const {
    data: orders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getOrders,
    onSuccess: (data) => {
      dispatch(setOrders(data));
    }
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (data) => {
      dispatch(addOrder(data));
      queryClient.invalidateQueries(['orders']);
    }
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }) => orderService.updateOrderStatus(id, status),
    onSuccess: (data) => {
      dispatch(updateOrderStatus({ orderId: data.id, status: data.status }));
      queryClient.invalidateQueries(['orders']);
    }
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: (data) => {
      dispatch(updateOrderStatus({ orderId: data.id, status: 'cancelled' }));
      queryClient.invalidateQueries(['orders']);
    }
  });

  // Get order by ID
  const getOrder = async (id) => {
    try {
      const order = await orderService.getOrderById(id);
      return order;
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw error;
    }
  };

  // Get order history with pagination
  const getOrderHistory = async (page = 1, limit = 10) => {
    try {
      const history = await orderService.getOrderHistory(page, limit);
      return history;
    } catch (error) {
      console.error('Failed to fetch order history:', error);
      throw error;
    }
  };

  // Track order
  const trackOrder = async (id) => {
    try {
      const tracking = await orderService.trackOrder(id);
      return tracking;
    } catch (error) {
      console.error(`Failed to track order ${id}:`, error);
      throw error;
    }
  };

  return {
    orders,
    isLoading,
    error,
    refetch,
    createOrder: createOrderMutation.mutateAsync,
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    cancelOrder: cancelOrderMutation.mutateAsync,
    getOrder,
    getOrderHistory,
    trackOrder,
    isCreating: createOrderMutation.isLoading,
    isUpdating: updateOrderStatusMutation.isLoading,
    isCancelling: cancelOrderMutation.isLoading,
  };
};

export default useOrders; 