const Topic = require('../models/Topic');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

// Create Topic
const createTopic = async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!title || !content || !categoryId) {
      return res.status(400).json({ 
        message: 'Please provide title, content and category' 
      });
    }

    // Cek apakah category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const topic = new Topic({
      title: title.trim(),
      content: content.trim(),
      userId,
      categoryId,
      isDeleted: false,
      viewCount: 0,
      commentCount: 0
    });

    const savedTopic = await topic.save();

    // Populate user dan category data
    const populatedTopic = await Topic.findById(savedTopic._id)
      .populate('userId', 'username avatarUrl')
      .populate('categoryId', 'name');

    res.status(201).json(populatedTopic);
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ 
      message: 'Failed to create topic',
      error: error.message 
    });
  }
};

// Get All Topics
const getAllTopics = async (req, res) => {
  try {
    // Ambil role dari user yang melakukan request
    const userRole = req.user.role;

    let query = {};
    
    // Jika bukan admin, hanya tampilkan topic yang tidak dihapus
    if (userRole !== 'admin') {
      query.isDeleted = false;
    }

    const topics = await Topic.find(query)
      .populate('userId', 'username avatarUrl')
      .populate('categoryId', 'name');

    // Update comment count for each topic
    for (let topic of topics) {
      await topic.updateCommentCount();
    }

    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Topic by ID
const getTopicById = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findOne({ _id: topicId, isDeleted: false })
      .populate('userId', 'username avatarUrl') // Populate user details
      .populate('categoryId', 'name'); // Populate category details

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Increment view count
    topic.viewCount += 1;
    await topic.save();

    await topic.updateCommentCount();
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Topic
const updateTopic = async (req, res) => {
  const { topicId } = req.params;
  const { title, content, categoryId, tags } = req.body;

  try {
    const topic = await Topic.findById(topicId);

    if (!topic || topic.isDeleted) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Verify user ownership
    if (topic.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this topic' });
    }

    // Update fields
    topic.title = title.trim();
    topic.content = content.trim();
    topic.categoryId = categoryId;
    topic.tags = tags || topic.tags;

    await topic.save();

    // Populate user dan category data
    const updatedTopic = await Topic.findById(topicId)
      .populate('userId', 'username avatarUrl')
      .populate('categoryId', 'name');

    res.json(updatedTopic);
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: 'Failed to update topic' });
  }
};

// Soft delete topic
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    ).populate('userId categoryId');
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Restore topic
const restoreTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    ).populate('userId categoryId');
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get latest topics with comment count
const getLatestTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username avatarUrl')
      .populate('categoryId', 'name');

    // Update comment count for each topic
    for (const topic of topics) {
      const commentCount = await Comment.countDocuments({
        topicId: topic._id,
        isDeleted: false
      });
      topic.commentCount = commentCount;
    }

    res.json(topics);
  } catch (error) {
    console.error('Error getting latest topics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch latest topics',
      error: error.message 
    });
  }
};

// Update comment count when comment is created
const updateTopicCommentCount = async (topicId) => {
  try {
    const topic = await Topic.findById(topicId);
    if (topic) {
      await topic.updateCommentCount();
    }
  } catch (error) {
    console.error('Error updating topic comment count:', error);
  }
};

module.exports = { createTopic, getAllTopics, getTopicById, updateTopic, deleteTopic, restoreTopic, getLatestTopics, updateTopicCommentCount };
