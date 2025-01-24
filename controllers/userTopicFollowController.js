const UserTopicFollows = require('../models/userTopicFollows');

// Follow Topic
const followTopic = async (req, res) => {
  const { userId, topicId } = req.body;

  try {
    // Cek apakah user sudah mengikuti topik
    const existingFollow = await UserTopicFollows.findOne({ userId, topicId });

    if (existingFollow) {
      return res.status(400).json({ message: 'User already follows this topic' });
    }

    // Jika belum mengikuti, tambahkan
    const follow = new UserTopicFollows({ userId, topicId });
    await follow.save();
    res.status(201).json({ message: 'Topic followed successfully', follow });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unfollow Topic
const unfollowTopic = async (req, res) => {
  const { userId, topicId } = req.body;

  try {
    const follow = await UserTopicFollows.findOne({ userId, topicId });

    if (!follow) {
      return res.status(404).json({ message: 'Follow record not found' });
    }

    await follow.deleteOne();
    res.status(200).json({ message: 'Topic unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Topics Followed by User
const getFollowedTopicsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const followedTopics = await UserTopicFollows.find({ userId }).populate('topicId');
    res.status(200).json(followedTopics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Users Following a Topic
const getUsersFollowingTopic = async (req, res) => {
  const { topicId } = req.params;

  try {
    const followers = await UserTopicFollows.find({ topicId }).populate('userId');
    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { followTopic, unfollowTopic, getFollowedTopicsByUser, getUsersFollowingTopic };
