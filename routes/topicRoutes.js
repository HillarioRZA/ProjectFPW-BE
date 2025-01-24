const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  restoreTopic,
  getLatestTopics
} = require('../controllers/topicController');

// Public routes
router.get('/latest', getLatestTopics); // Remove protect middleware if public

// Protected routes
router.post('/', protect, createTopic);
router.get('/', protect, getAllTopics);
router.get('/:topicId', protect, getTopicById);
router.put('/:topicId', protect, updateTopic);
router.patch('/:id/delete', protect, deleteTopic);
router.patch('/:id/restore', protect, restoreTopic);

module.exports = router;
