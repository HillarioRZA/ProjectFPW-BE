const mongoose = require('mongoose');

// Schema untuk Comment
const commentSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    trim: true,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment', // Referensi ke komentar lain (jika ini adalah balasan)
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware untuk memperbarui updatedAt ketika data diubah
commentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
