const mongoose = require('mongoose');

const SolutionSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Codeforces', 'LeetCode', 'CodeChef', 'AtCoder', 'HackerRank', 'Other']
  },
  contestName: {
    type: String,
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  thumbnailUrl: {
    type: String
  },
  publishedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});


SolutionSchema.index({ contestId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('Solution', SolutionSchema);
