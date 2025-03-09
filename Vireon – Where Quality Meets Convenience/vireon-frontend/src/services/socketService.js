import { io } from 'socket.io-client';
import { API_URL } from '../config';
import { store } from '../store';
import { 
  updateOrderStatus, 
  addNotification,
  updatePaymentStatus
} from '../store/actions';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket) return;

    this.socket = io(API_URL, {
      query: { userId },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });

    // Listen for order updates
    this.socket.on('order_status_update', (data) => {
      store.dispatch(updateOrderStatus({
        orderId: data.orderId,
        status: data.status,
        updatedAt: data.updatedAt
      }));

      // Also create a notification
      store.dispatch(addNotification({
        type: 'order_update',
        message: `Your order #${data.orderId} is now ${data.status}`,
        timestamp: new Date().toISOString(),
        read: false
      }));
    });

    // Listen for payment updates
    this.socket.on('payment_status_update', (data) => {
      store.dispatch(updatePaymentStatus({
        paymentId: data.paymentId,
        status: data.status,
        orderId: data.orderId
      }));
    });

    // Listen for product availability changes
    this.socket.on('product_stock_update', (data) => {
      // Handle product stock updates in real-time
      // Useful for displaying "Only X left" or "Out of stock"
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a specific order room to get detailed updates
  joinOrderRoom(orderId) {
    if (!this.isConnected || !orderId) return;
    this.socket.emit('join_order_room', { orderId });
  }

  // Leave an order room
  leaveOrderRoom(orderId) {
    if (!this.isConnected || !orderId) return;
    this.socket.emit('leave_order_room', { orderId });
  }
}

export const socketService = new SocketService();
export default socketService; 