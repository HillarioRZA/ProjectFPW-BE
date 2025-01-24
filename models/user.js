const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Membuat schema untuk User
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Menghindari email duplikat
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'], // Validasi email
  },
  username: {
    type: String,
    required: true,
    unique: true, // Menghindari username duplikat
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimal panjang password
  },
  avatarUrl: {
    type: String, // URL untuk gambar avatar
    default: '/default-avatar.png',
  },
  role: {
    type: String,
    enum: ['admin', 'user'], // Role bisa admin atau user
    default: 'user',
  },
  bio: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true, // Status aktif akun
  },
  githubId: {
    type: String,
    unique: true, // Unik jika menggunakan login GitHub
  },
  banStatus: {
    isBanned: {
      type: Boolean,
      default: false
    },
    banExpires: {
      type: Date,
      default: null
    },
    banReason: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Menambahkan hash password sebelum disimpan ke DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Lewati jika password tidak diubah
  const salt = await bcrypt.genSalt(10); // Membuat salt untuk enkripsi
  this.password = await bcrypt.hash(this.password, salt); // Hash password
  next();
});

// Membuat method untuk membandingkan password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add method to check if user is banned
userSchema.methods.isBanned = function() {
  if (!this.banStatus.isBanned) return false;
  if (!this.banStatus.banExpires) return true; // permanent ban
  return new Date() < this.banStatus.banExpires;
};

// Add method to format ban message
userSchema.methods.formatBanMessage = function() {
  if (!this.banStatus.isBanned) return null;
  
  if (!this.banStatus.banExpires) {
    return `Your account has been permanently banned. Reason: ${this.banStatus.banReason}`;
  }

  const now = new Date();
  const banEnd = new Date(this.banStatus.banExpires);
  const daysLeft = Math.ceil((banEnd - now) / (1000 * 60 * 60 * 24));
  
  return `Your account is banned for ${daysLeft} more day${daysLeft > 1 ? 's' : ''}. Ban expires on ${banEnd.toLocaleString()}. Reason: ${this.banStatus.banReason}`;
};

module.exports = mongoose.model('User', userSchema);
