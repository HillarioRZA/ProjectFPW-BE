const express = require('express');
const { 
  registerUser, 
  loginUser, 
  updateUser, 
  getUserById, 
  deleteUser, 
  getCurrentUser,
  getAllUsers,
  activateUser,
  deactivateUser,
  banUser,
  unbanUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.use(protect);

// Current user route
router.get('/me', getCurrentUser);

// Admin only routes
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/activate', activateUser);
router.patch('/users/:id/deactivate', deactivateUser);

// Add ban/unban routes under admin routes
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);

// Other user management routes
router.get('/:userId', getUserById);
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

module.exports = router;
