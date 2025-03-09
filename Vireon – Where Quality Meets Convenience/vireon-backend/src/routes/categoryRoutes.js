import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Category from '../models/Category.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { featured, parent } = req.query;
    
    // Build filter
    const filter = {};
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    if (parent === 'null' || parent === 'undefined') {
      filter.parent = null;
    } else if (parent) {
      filter.parent = parent;
    }
    
    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 })
      .populate('parent', 'name slug');
    
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let category;
    
    // Check if identifier is ObjectId or slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(identifier);
    } else {
      category = await Category.findOne({ slug: identifier });
    }
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Category details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new category (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { name, description, parent, image, featured, order, slug } = req.body;
    
    // Validate name
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if slug or name already exists
    const existingCategory = await Category.findOne({ 
      $or: [{ name }, { slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') }]
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name or slug already exists' });
    }
    
    // Create new category
    const category = new Category({
      name,
      description,
      parent,
      image,
      featured,
      order,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    });
    
    const savedCategory = await category.save();
    
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a category (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { name, description, parent, image, featured, order, slug } = req.body;
    
    // Find category
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if updating to existing name or slug
    if (name !== category.name || slug !== category.slug) {
      const existingCategory = await Category.findOne({
        _id: { $ne: req.params.id },
        $or: [
          { name },
          { slug: slug || (name && name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')) }
        ]
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name or slug already exists' });
      }
    }
    
    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = parent === '' ? null : parent;
    if (image !== undefined) category.image = image;
    if (featured !== undefined) category.featured = featured;
    if (order !== undefined) category.order = order;
    if (slug) category.slug = slug;
    
    const updatedCategory = await category.save();
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a category (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has children
    const hasChildren = await Category.findOne({ parent: req.params.id });
    
    if (hasChildren) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories. Please delete or reassign subcategories first.'
      });
    }
    
    await category.remove();
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 