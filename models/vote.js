const mongoose = require('mongoose');

// Schema untuk Vote
const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referensi ke koleksi User
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // ID dari topik atau komentar yang di-vote
  },
  referenceType: {
    type: String,
    enum: ['topic', 'comment'], // Jenis referensi: bisa 'topic' atau 'comment'
    required: true,
  },
  value: {
    type: Number,
    enum: [1, 0,-1], // 1 untuk upvote, -1 untuk downvote
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vote', voteSchema);
