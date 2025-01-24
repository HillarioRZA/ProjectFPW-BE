const mongoose = require('mongoose');

// Membuat schema untuk Topic
const topicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  viewCount: {
    type: Number,
    default: 0, // Default view count adalah 0
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false, // Default topic tidak dihapus
  },
  createdAt: {
    type: Date,
    default: Date.now, // Waktu pembuatan otomatis di-set
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Waktu update otomatis di-set
  },
  tags: {
    type: [String], // Array string untuk menyimpan tag
    validate: {
      validator: (tags) => tags.length <= 3, // Maksimal 3 tag
      message: 'You can add up to 3 tags only',
    },
  },
}, {
  timestamps: true // Ini akan menambahkan createdAt dan updatedAt secara otomatis
});

// Method untuk update comment count
topicSchema.methods.updateCommentCount = async function() {
  const Comment = require('./Comment');
  const count = await Comment.countDocuments({ 
    topicId: this._id,
    isDeleted: false 
  });
  this.commentCount = count;
  await this.save();
};

module.exports = mongoose.model('Topic', topicSchema);

// Middleware untuk mengupdate `updatedAt`