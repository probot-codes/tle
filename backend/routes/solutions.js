const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Solution = require('../models/Solution');
const Contest = require('../models/Contest');
const youtubeService = require('../services/youtubeService');

router.get('/', async (req, res) => {
  try {
    const solutions = await Solution.find().sort({ publishedAt: -1 });
    res.json(solutions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/contest/:contestId', async (req, res) => {
  try {
    const solutions = await Solution.find({ 
      contestId: req.params.contestId 
    }).sort({ publishedAt: -1 });
    
    res.json(solutions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/contest/name/:contestName', async (req, res) => {
  try {
    const solutions = await Solution.find({ 
      contestName: { $regex: new RegExp(req.params.contestName, 'i') } 
    }).sort({ publishedAt: -1 });
    
    res.json(solutions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/platform/:platform', async (req, res) => {
  try {
    const solutions = await Solution.find({ 
      platform: req.params.platform 
    }).sort({ publishedAt: -1 });
    
    res.json(solutions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/sync', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    const summary = await youtubeService.syncAllPlaylists();
    res.json({ message: 'YouTube playlist sync completed', summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
