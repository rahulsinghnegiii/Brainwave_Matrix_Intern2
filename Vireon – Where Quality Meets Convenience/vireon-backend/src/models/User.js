import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'United States' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: false },
  role: { 
    type: String, 
    enum: ['user', 'admin'],
    default: 'user'
  },
  addresses: [AddressSchema],
  createdAt: { type: Date, default: Date.now },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Pre-save hook to ensure only one default address
UserSchema.pre('save', function(next) {
  if (this.addresses && this.addresses.length > 0) {
    // If there's no default address, make the first one default
    const hasDefault = this.addresses.some(addr => addr.isDefault);
    if (!hasDefault) {
      this.addresses[0].isDefault = true;
    }
    
    // Ensure only one default address
    let defaultFound = false;
    this.addresses.forEach(addr => {
      if (addr.isDefault) {
        if (defaultFound) {
          addr.isDefault = false;
        }
        defaultFound = true;
      }
    });
  }
  next();
});

// Method to add address
UserSchema.methods.addAddress = function(address) {
  if (!this.addresses) {
    this.addresses = [];
  }
  
  // If this is the first address, make it default
  if (this.addresses.length === 0) {
    address.isDefault = true;
  }
  
  this.addresses.push(address);
  return this.save();
};

// Method to set default address
UserSchema.methods.setDefaultAddress = function(addressId) {
  this.addresses.forEach(addr => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });
  return this.save();
};

// In case the model is already defined
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
