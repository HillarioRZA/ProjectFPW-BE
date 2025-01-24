const express = require('express');
const {
  followTopic,
  unfollowTopic,
  getFollowedTopicsByUser,
  getUsersFollowingTopic,
} = require('../controllers/userTopicFollowController');

const router = express.Router();

// Routes untuk UserTopicFollows
router.post('/follow', followTopic); // User mengikuti topik
router.post('/unfollow', unfollowTopic); // User berhenti mengikuti topik
router.get('/user/:userId', getFollowedTopicsByUser); // Topik yang diikuti oleh user
router.get('/topic/:topicId', getUsersFollowingTopic); // User yang mengikuti topik

module.exports = router;
