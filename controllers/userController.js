const User = require('../models/user');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, bio } = req.body;
    let avatarUrl = undefined;

    // Find user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle file upload if exists
    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    // Only update fields that were sent
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    // Update user with only changed fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

module.exports = {
  // ... other exports
  updateProfile,
  getProfile
}; 