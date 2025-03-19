const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');


router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(user.bookmarkedContests);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', auth, async (req, res) => {
  try {
    const { contestId, slug, name, platform, date, link, duration, status } = req.body;
    
    if (!contestId || !slug || !name || !platform || !date) {
      return res.status(400).json({ message: 'Missing required contest information' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    
    const isAlreadyBookmarked = user.bookmarkedContests.some(
      contest => contest.contestId === contestId && contest.platform === platform
    );
    
    if (isAlreadyBookmarked) {
      return res.status(400).json({ message: 'Contest already bookmarked' });
    }
    
    
    user.bookmarkedContests.push({
      contestId,
      slug,
      name,
      platform,
      date: new Date(date),
      link,
      duration,
      status,
      bookmarkedAt: new Date()
    });
    
    await user.save();
    
    return res.status(201).json({ 
      message: 'Contest bookmarked successfully',
      bookmarkedContests: user.bookmarkedContests
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:contestId', auth, async (req, res) => {
  try {
    const { contestId } = req.params;
    const { platform } = req.query; 
    
    if (!contestId || !platform) {
      return res.status(400).json({ message: 'Contest ID and platform are required' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    
    const bookmarkIndex = user.bookmarkedContests.findIndex(
      contest => contest.contestId === contestId && contest.platform === platform
    );
    
    if (bookmarkIndex === -1) {
      return res.status(400).json({ message: 'Contest not found in bookmarks' });
    }
    
    
    user.bookmarkedContests.splice(bookmarkIndex, 1);
    await user.save();
    
    return res.json({ 
      message: 'Contest removed from bookmarks', 
      bookmarkedContests: user.bookmarkedContests 
    });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.get('/check/:contestId', auth, async (req, res) => {
  try {
    const { contestId } = req.params;
    const { platform } = req.query; 
    
    if (!contestId || !platform) {
      return res.status(400).json({ message: 'Contest ID and platform are required' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    
    const isBookmarked = user.bookmarkedContests.some(
      contest => contest.contestId === contestId && contest.platform === platform
    );
    
    return res.json({ isBookmarked });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
