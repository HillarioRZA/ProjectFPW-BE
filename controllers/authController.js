const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
  const { email, username, password, avatarUrl, githubId } = req.body;

  try {
    // Cek apakah email sudah ada
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already in use' });
    }

    // Membuat pengguna baru
    const user = new User({
      email,
      username,
      password,
      avatarUrl,
      role: 'user',
      githubId,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Username not found' });
    }

    // Check if user is banned
    if (user.isBanned()) {
      return res.status(403).json({ 
        message: user.formatBanMessage(),
        banStatus: user.banStatus // Send ban status for frontend use
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id, role: user.role }, 'proyekFPW', {
      expiresIn: '1h',
    });

    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { email, username, avatarUrl, role, isActive } = req.body;

  try {
    // Mencari user berdasarkan userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.email = email || user.email;
    user.username = username || user.username;
    user.avatarUrl = avatarUrl || user.avatarUrl;
    user.role = role || user.role;
    user.isActive = isActive || user.isActive;

    await user.save();
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    // Hanya ambil user dengan role 'user'
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Activate User
const activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Deactivate User
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deactivating admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot deactivate admin users' });
    }

    user.isActive = false;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Ban User
const banUser = async (req, res) => {
  try {
    const { duration, reason } = req.body; // duration in days, null for permanent
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban admin users' });
    }

    user.banStatus = {
      isBanned: true,
      banExpires: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null,
      banReason: reason || 'No reason provided'
    };

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Unban User
const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        banStatus: {
          isBanned: false,
          banExpires: null,
          banReason: null
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, updateUser, getUserById, deleteUser, getCurrentUser, getAllUsers, activateUser, deactivateUser, banUser, unbanUser };
