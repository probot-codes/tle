const mongoose = require('mongoose');

const bookmarkedContestSchema = new mongoose.Schema({
  contestId: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  link: String,
  duration: String,
  status: {
    type: String,
    enum: ['UPCOMING', 'ONGOING', 'FINISHED'],
    default: 'UPCOMING'
  },
  bookmarkedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  bookmarkedContests: [bookmarkedContestSchema],
  preferredPlatforms: {
    type: [String],
    default: ['Codeforces', 'CodeChef', 'LeetCode']
  },
  notificationSettings: {
    email: {
      enabled: { type: Boolean, default: false },
      reminderTime: { type: Number, default: 60 } 
    },
    browser: {
      enabled: { type: Boolean, default: true },
      reminderTime: { type: Number, default: 15 } 
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
