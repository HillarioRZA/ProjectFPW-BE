const express = require('express');
const {
  createComment,
  getCommentsByTopicId,
  updateComment,
  deleteComment,
  getAllComments,
  restoreComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');

const router = express.Router();

// Routes untuk Comments
router.use(protect);

router.post('/', createComment);
router.get('/:topicId', getCommentsByTopicId);
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);

router.get('/', getAllComments);
router.patch('/:id/delete', deleteComment);
router.patch('/:id/restore', restoreComment);

// Get comments by topic ID
router.get('/topic/:topicId', getCommentsByTopicId);

module.exports = router;
