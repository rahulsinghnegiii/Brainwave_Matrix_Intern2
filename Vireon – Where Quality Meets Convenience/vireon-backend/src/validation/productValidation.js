import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10).max(1000),
  price: Joi.number().required().min(0),
  category: Joi.string().required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().uri().optional()
});

export const validateProduct = (data) => {
  return productSchema.validate(data);
}; 