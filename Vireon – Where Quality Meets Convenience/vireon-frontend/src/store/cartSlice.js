import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage if available
const getInitialCart = () => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : { items: [], totalItems: 0 };
};

const saveCartToStorage = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  discount: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: getInitialCart(),
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.itemCount = action.payload.items.length;
      state.discount = action.payload.discount;
      state.loading = false;
      state.error = null;
    },
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Increment quantity if product already in cart
        state.items[existingItemIndex].quantity += 1;
      } else {
        // Add new product to cart
        state.items.push({
          ...product,
          quantity: 1
        });
      }
      
      // Update total items count
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      
      // Save to localStorage
      saveCartToStorage(state);
    },
    updateCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      
      if (item) {
        item.quantity = quantity;
      }
      
      state.total = calculateTotal(state.items, state.discount);
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
      
      // Update total items count
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      
      // Save to localStorage
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      state.discount = null;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
      state.total = calculateTotal(state.items, state.discount);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Helper function to calculate total
const calculateTotal = (items, discount) => {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  if (!discount) return subtotal;
  
  const discountAmount = discount.type === 'percentage'
    ? subtotal * (discount.value / 100)
    : discount.value;
    
  return Math.max(0, subtotal - discountAmount);
};

export const {
  setCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  setDiscount,
  setLoading,
  setError,
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartDiscount = (state) => state.cart.discount;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer; 