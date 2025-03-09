import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
  }],
  total: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Cart", CartSchema); 