const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require('../controllers/categoryController');
const Category = require('../models/Category');

// Route untuk kategori
router.post('/', createCategory); // Create Category
router.get('/', getAllCategories); // Get All Categories
router.get('/:categoryId', getCategoryById); // Get Category by ID
router.put('/:categoryId', updateCategory); // Update Category
router.delete('/:categoryId', deleteCategory); // Delete Category

// Get all categories
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
