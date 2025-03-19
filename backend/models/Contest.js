const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Codeforces', 'LeetCode', 'CodeChef', 'AtCoder', 'HackerRank', 'Other']
  },
  link: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  registrationLink: {
    type: String
  },
  description: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Unknown'],
    default: 'Unknown'
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  },
  solutionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Solution'
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Contest', ContestSchema);
