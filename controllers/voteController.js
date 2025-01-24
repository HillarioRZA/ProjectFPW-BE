const Vote = require('../models/Vote');

// Create Vote
const createVote = async (req, res, io) => {
  const { userId, referenceId, referenceType, value } = req.body;

  try {
    // Cek apakah vote sudah ada
    const existingVote = await Vote.findOne({ userId, referenceId, referenceType });

    if (existingVote) {
      if (existingVote.value === value) {
        // Jika vote sama, hapus vote (unvote)
        await Vote.findByIdAndDelete(existingVote._id);
        
        // Emit event untuk vote dihapus
        io.emit('voteUpdated', {
          referenceId,
          referenceType,
          action: 'delete'
        });

        return res.status(200).json({ 
          message: 'Vote removed successfully',
          action: 'delete',
          vote: null
        });
      } else {
        // Update nilai vote jika berbeda
        existingVote.value = value;
        await existingVote.save();

        // Emit event untuk vote diupdate
        io.emit('voteUpdated', {
          voteId: existingVote._id,
          referenceId,
          referenceType,
          value: existingVote.value,
          action: 'update'
        });

        return res.status(200).json({ 
          message: 'Vote updated successfully', 
          vote: existingVote,
          action: 'update'
        });
      }
    }

    // Buat vote baru
    const vote = new Vote({ userId, referenceId, referenceType, value });
    await vote.save();

    // Emit event untuk vote baru
    io.emit('voteUpdated', {
      voteId: vote._id,
      referenceId,
      referenceType,
      value: vote.value,
      action: 'create'
    });

    res.status(201).json({ 
      message: 'Vote created successfully', 
      vote,
      action: 'create'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      vote: null
    });
  }
};

// Get Votes for Reference
const getVotesByReferenceId = async (req, res) => {
  const { referenceId, referenceType } = req.params;

  try {
    const votes = await Vote.find({ referenceId, referenceType });
    res.status(200).json(votes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Vote
const deleteVote = async (req, res, io) => {
  const { voteId } = req.params;

  try {
    const vote = await Vote.findById(voteId);

    if (!vote) {
      return res.status(404).json({ message: 'Vote not found' });
    }

    await vote.deleteOne();

    // Emit notifikasi real-time
    io.emit('voteDeleted', { voteId: vote._id });

    res.status(200).json({ message: 'Vote deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createVote, getVotesByReferenceId, deleteVote };
