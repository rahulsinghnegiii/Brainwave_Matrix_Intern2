import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import productReducer from './productSlice';
import adminReducer from './adminSlice';
import orderReducer from './orderSlice';
import reviewReducer from './reviewSlice';
import notificationReducer from './notificationSlice';
import wishlistReducer from './wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    orders: orderReducer,
    reviews: reviewReducer,
    notifications: notificationReducer,
    wishlist: wishlistReducer,
    admin: adminReducer,
  },
}); 