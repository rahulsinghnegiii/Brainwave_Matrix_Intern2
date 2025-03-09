import { body, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: 'Validation failed'
    });
  }
  next();
};

// Product validation rules
export const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5')
];

// User validation rules
export const userValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Invalid phone number format'),
  
  body('addresses.*.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street is required for address'),
  
  body('addresses.*.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City is required for address'),
  
  body('addresses.*.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State is required for address'),
  
  body('addresses.*.zipCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Zip code is required for address')
];

// Order validation rules
export const orderValidation = [
  body('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isObject()
    .withMessage('Invalid shipping address format'),
  
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street is required'),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'paypal'])
    .withMessage('Invalid payment method')
];

// Cart validation rules
export const cartValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
]; 