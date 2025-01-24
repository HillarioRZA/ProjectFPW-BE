const mongoose = require('mongoose');

// Schema untuk UserTopicFollows
const userTopicFollowsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referensi ke koleksi User
    required: true,
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic', // Referensi ke koleksi Topic
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Waktu saat user mengikuti topik
  },
});

// Mencegah duplikasi userId dan topicId
userTopicFollowsSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('UserTopicFollows', userTopicFollowsSchema);
