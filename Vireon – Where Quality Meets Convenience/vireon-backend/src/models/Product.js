import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"]
  },
  description: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price must be a positive number"]
  },
  category: {
    type: String,
    required: [true, "Product category is required"]
  },
  stock: {
    type: Number,
    required: [true, "Stock quantity is required"],
    min: [0, "Stock cannot be negative"]
  },
  image: {
    type: String,
    default: ""
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, "Rating cannot be negative"],
    max: [5, "Rating cannot be more than 5"]
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: function() {
      return this.stock > 0;
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
ProductSchema.virtual('averageRating').get(function() {
  return this.ratingCount > 0 ? this.rating / this.ratingCount : 0;
});

// Pre-save middleware to update inStock based on stock quantity
ProductSchema.pre('save', function(next) {
  this.inStock = this.stock > 0;
  next();
});

// In case the model is already defined
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
