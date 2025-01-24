const Comment = require('../models/comment');
const User = require('../models/user');
const Topic = require('../models/Topic');
const { updateTopicCommentCount } = require('./topicController');

let io; // Variable untuk menyimpan instance Socket.IO

// Mengatur instance Socket.IO
const setSocketIO = (socketIO) => {
  io = socketIO;
};



// Create Comment
// Create Comment
// Create Comment
const createComment = async (req, res) => {
  try {
    const { content, topicId, replyTo } = req.body;
    const userId = req.user.id;

    const comment = new Comment({
      content,
      userId,
      topicId,
      replyTo,
    });

    const savedComment = await comment.save();
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('userId', 'username avatarUrl');

    // Emit event ke semua client di room topic
    io.to(`topic_${topicId}`).emit('commentAdded', populatedComment);

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
};

// Get Comments for a Topic
const getCommentsByTopicId = async (req, res) => {
  const { topicId } = req.params;

  try {
    const comments = await Comment.find({ 
      topicId, 
      isDeleted: false 
    })
    .populate('userId', 'username avatarUrl')
    .sort({ createdAt: -1 });

    const commentCount = await Comment.countDocuments({
      topicId,
      isDeleted: false
    });

    res.status(200).json({
      comments,
      commentCount
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Comment
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate('userId', 'username avatarUrl');

    // Emit updated comment
    io.to(`topic_${comment.topicId}`).emit('commentUpdated', updatedComment);

    res.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
};

// Get All Comments with search
const getAllComments = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // Jika bukan admin, hanya tampilkan comment yang tidak dihapus
    if (req.user.role !== 'admin') {
      query.isDeleted = false;
    }

    // Jika ada search query, tambahkan ke query
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { 'topicId.title': { $regex: search, $options: 'i' } }
      ];
    }

    const comments = await Comment.find(query)
      .populate('userId', 'username avatarUrl')
      .populate('topicId', 'title');

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership or admin role
    if (comment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.isDeleted = true;
    await comment.save();

    // Emit deleted comment
    io.to(`topic_${comment.topicId}`).emit('commentDeleted', { id: comment._id, topicId: comment.topicId });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

// Restore comment
const restoreComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Update topic comment count
    await updateTopicCommentCount(comment.topicId);

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComment,
  getCommentsByTopicId,
  updateComment,
  deleteComment,
  restoreComment,
  getAllComments,
  setSocketIO
};
