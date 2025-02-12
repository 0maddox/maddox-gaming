const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  bio: {
    type: String,
    default: ''
  },
  contact: {
    phone: String,
    discord: String,
    twitter: String
  },
  profilePicture: {
    type: String,
    default: '/default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ username: 'maddox' });
    if (!adminExists) {
      await User.create({
        username: 'maddox',
        email: 'maddox@maddoxgaming.com',
        password: 'maddox@311',
        role: 'admin',
        bio: 'CEO of Maddox Gaming. Professional Call of Duty Mobile player and content creator. Passionate about building a competitive gaming community and helping players reach their full potential.',
        contact: {
          discord: 'maddox#0001',
          twitter: '@maddoxgaming'
        }
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

createAdminUser();

module.exports = User; 