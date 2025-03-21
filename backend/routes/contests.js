const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { getCodeChefContests, getLeetCodeContests, getAllContests } = require('../utils/contestScraper');
const Contest = require('../models/Contest');
const Solution = require('../models/Solution');

const router = express.Router();


router.get('/codeforces', async (req, res) => {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list');
    
    const upcomingContests = response.data.result
      .filter(contest => contest.phase === 'BEFORE')
      .map(contest => {
        return {
          id: contest.id,  
          name: contest.name || 'Unnamed Contest',
          platform: 'Codeforces',
          date: new Date(contest.startTimeSeconds * 1000).toISOString(),
          link: 'https://codeforces.com/contest/' + contest.id,
          duration: Math.floor(contest.durationSeconds / 3600) + ' hours',
          status: 'UPCOMING'
        };
      });
      
    const pastContests = response.data.result
      .filter(contest => contest.phase === 'FINISHED')
      .slice(0, 20) 
      .map(contest => {
        return {
          id: contest.id,  
          name: contest.name || 'Unnamed Contest',
          platform: 'Codeforces',
          date: new Date(contest.startTimeSeconds * 1000).toISOString(),
          link: `https://codeforces.com/contest/${contest.id}`,
          duration: Math.floor(contest.durationSeconds / 3600) + ' hours',
          status: 'FINISHED'
        };
      });
    
    const allContests = [...upcomingContests, ...pastContests];
    res.json(allContests);
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error);
    res.status(500).json({ message: 'Error fetching Codeforces contests' });
  }
});


router.get('/codechef', async (req, res) => {
  try {
    const contests = await getCodeChefContests();
    res.json(contests);
  } catch (error) {
    console.error('Error fetching CodeChef contests:', error);
    res.status(500).json({ message: 'Error fetching CodeChef contests' });
  }
});


router.get('/leetcode', async (req, res) => {
  try {
    const contests = await getLeetCodeContests();
    res.json(contests);
  } catch (error) {
    console.error('Error fetching LeetCode contests:', error);
    res.status(500).json({ message: 'Error fetching LeetCode contests' });
  }
});


router.get('/all', async (req, res) => {
  try {
    
    const codeforcesResponse = await axios.get('https://codeforces.com/api/contest.list');

    
    
    const upcomingCodeforcesContests = codeforcesResponse.data.result
      .filter(contest => contest.phase === 'BEFORE')
      .map(contest => ({
        id: contest.id,  
        platform: 'Codeforces',
        name: contest.name || 'Unnamed Contest',
        date: new Date(contest.startTimeSeconds * 1000).toISOString(),
        link: 'https://codeforces.com/contest/' + contest.id,
        duration: Math.floor(contest.durationSeconds / 3600) + ' hours',
        status: 'UPCOMING'
      }));
      
    
    const pastCodeforcesContests = codeforcesResponse.data.result
      .filter(contest => contest.phase === 'FINISHED')
      .slice(0, 20) 
      .map(contest => ({
        id: contest.id,  
        platform: 'Codeforces',
        name: contest.name || 'Unnamed Contest',
        date: new Date(contest.startTimeSeconds * 1000).toISOString(),
        link: `https://codeforces.com/contest/${contest.id}`,
        duration: Math.floor(contest.durationSeconds / 3600) + ' hours',
        status: 'FINISHED'
      }));

    
    const [codechefContests, leetcodeContests] = await Promise.all([
      getCodeChefContests(),
      getLeetCodeContests()
    ]);

    
    const allContests = [
      ...upcomingCodeforcesContests,
      ...pastCodeforcesContests,
      ...codechefContests,
      ...leetcodeContests
    ];

    
    allContests.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(allContests);
  } catch (error) {
    console.error('Error fetching all contests:', error);
    res.status(500).json({ message: 'Error fetching contests' });
  }
});


router.get('/:platform/:slug', async (req, res) => {
  try {
    const { platform, slug } = req.params;
    console.log(`Fetching contest for platform: ${platform}, slug: ${slug}`);
    
    let contest = null;
    let solutions = [];
    
    
    const dbContest = await Contest.findOne({ 
      platform: platform, 
      $or: [
        { slug: slug },
        { 'name': { $regex: new RegExp(slug, 'i') }}
      ]
    }).populate('solutionIds');
    
    if (dbContest) {
      contest = dbContest;
      
      if (dbContest.solutionIds && dbContest.solutionIds.length > 0) {
        solutions = dbContest.solutionIds;
      }
    }
    
    res.set('Content-Type', 'application/json');
    
    try {
      console.log('Fetching all contests from getAllContests function');
      const allContests = await getAllContests();
      console.log(`Total contests: ${allContests ? allContests.length : 0}`);
      
      if (allContests && allContests.length) {
        
        let platformContests = allContests.filter(c => 
          c.platform && c.platform.toLowerCase() === platform.toLowerCase());
        console.log(`Filtered contests for ${platform}: ${platformContests.length}`);
        
        
        contest = platformContests.find(c => c.slug === slug);
        if (contest) {
          console.log(`Found contest by slug: ${contest.name}`);
          return res.json(contest);
        }
        
        
        if (/^\d+$/.test(slug)) {
          const contestIndex = parseInt(slug);
          console.log(`Looking for contest at index: ${contestIndex}`);
          
          if (contestIndex >= 0 && contestIndex < platformContests.length) {
            contest = platformContests[contestIndex];
            console.log(`Found contest by index: ${contest.name}`);
            return res.json(contest);
          } else {
            console.log(`Index ${contestIndex} out of bounds (0-${platformContests.length-1})`);
          }
        }
      }
    } catch (indexError) {
      console.error('Error in index lookup approach:', indexError);
    }
    
    
    console.log('Trying platform-specific API calls as fallback');
    let response;
    switch (platform.toLowerCase()) {
      case 'codeforces':
        response = await axios.get('https://codeforces.com/api/contest.list');
        const allCodeforcesContests = [
          ...response.data.result
            .filter(contest => contest.phase === 'BEFORE')
            .map(contest => ({
              id: contest.id,
              name: contest.name || 'Unnamed Contest',
              platform: 'Codeforces',
              date: new Date(contest.startTimeSeconds * 1000).toISOString(),
              link: 'https://codeforces.com/contest/' + contest.id,
              duration: Math.floor(contest.durationSeconds / 3600) + ' hours',
              status: 'UPCOMING'
            })),
          ...response.data.result
            .filter(contest => contest.phase === 'FINISHED')
            .map(contest => ({
              id: contest.id,
              name: contest.name || 'Unnamed Contest',
              platform: 'Codeforces',
              date: new Date(contest.startTimeSeconds * 1000).toISOString(),
              link: `https://codeforces.com/contest/${contest.id}`,
              duration: Math.floor(contest.durationSeconds / 3600) + ' hours',
              status: 'FINISHED'
            }))
        ];
        contest = allCodeforcesContests.find(c => c.id.toString() === slug);
        break;
        
      case 'codechef':
        response = await axios.get('https://www.codechef.com/api/list/contests');
        const allCodeChefContests = [
          ...response.data.present_contests.map(contest => ({
            id: contest.contest_code,
            name: contest.contest_name,
            platform: 'CodeChef',
            date: new Date(contest.contest_start_date_iso).toISOString(),
            link: `https://www.codechef.com/${contest.contest_code}`,
            duration: parseInt(contest.contest_duration, 10) + ' mins',
            status: 'ONGOING'
          })),
          ...response.data.future_contests.map(contest => ({
            id: contest.contest_code,
            name: contest.contest_name,
            platform: 'CodeChef',
            date: new Date(contest.contest_start_date_iso).toISOString(),
            link: `https://www.codechef.com/${contest.contest_code}`,
            duration: parseInt(contest.contest_duration, 10) + ' mins',
            status: 'UPCOMING'
          })),
          ...response.data.past_contests.map(contest => ({
            id: contest.contest_code,
            name: contest.contest_name,
            platform: 'CodeChef',
            date: new Date(contest.contest_start_date_iso).toISOString(),
            link: `https://www.codechef.com/${contest.contest_code}`,
            duration: parseInt(contest.contest_duration, 10) + ' mins',
            status: 'FINISHED'
          }))
        ];
        contest = allCodeChefContests.find(c => c.id.toString() === slug);
        break;
        
      case 'leetcode':
        response = await axios({
          url: 'https://leetcode.com/graphql',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            query: `
              query {
                allContests {
                  containsPremium
                  title
                  titleSlug
                  startTime
                  duration
                  originStartTime
                }
              }
            `,
          },
        });
        
        if (response.data.data && response.data.data.allContests) {
          const allLeetCodeContests = response.data.data.allContests.map((contest, index) => ({
            id: contest.titleSlug || index,
            name: contest.title,
            platform: 'LeetCode',
            date: new Date(contest.startTime * 1000).toISOString(),
            link: `https://leetcode.com/contest/${contest.titleSlug}`,
            duration: Math.floor(contest.duration / 60) + ' mins',
            status: new Date(contest.startTime * 1000) > new Date() ? 'UPCOMING' : 'FINISHED'
          }));
          contest = allLeetCodeContests.find(c => c.id.toString() === slug);
        }
        break;
        
      default:
        return res.status(404).json({ message: 'Platform not found' });
    }
    
    
    if (!contest) {
      console.log('Contest not found by direct lookup. Trying final text search approach.');
      try {
        const allContests = await getAllContests();
        
        console.log(`Trying to find contest with name containing: ${slug}`);
        contest = allContests.find(c => 
          c.platform.toLowerCase() === platform.toLowerCase() && 
          (c.name.toLowerCase().includes(slug.toLowerCase()) || 
           (c.id && c.id.toString().toLowerCase().includes(slug.toLowerCase())))
        );
        
        if (contest) {
          console.log(`Found contest by text match: ${contest.name}`);
        }
      } catch (finalError) {
        console.error('Error in final text search approach:', finalError);
      }
    }
    
    if (contest) {
      
      if (!dbContest) {
        
        try {
          
          const foundSolutions = await Solution.find({
            $or: [
              { contestName: { $regex: new RegExp(contest.name, 'i') } },
              { contestId: contest.id }
            ]
          });
          
          if (foundSolutions && foundSolutions.length > 0) {
            solutions = foundSolutions;
          }
        } catch (solutionErr) {
          console.error('Error getting solutions:', solutionErr);
        }
      }
      
      
      res.json({
        ...contest,
        solutions: solutions || []
      });
    } else {
      res.status(404).json({ message: 'Contest not found' });
    }
  } catch (error) {
    console.error(`Error fetching contest details for ${req.params.platform}/${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:contestId/sync-solutions', async (req, res) => {
  try {
    const { contestId } = req.params;
    
    
    const contest = await Contest.findById(contestId);
    
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    
    
    const youtubeService = require('../services/youtubeService');
    const result = await youtubeService.syncAllPlaylists();
    
    
    const solutions = await Solution.find({ contestId: contest._id });
    
    res.json({
      message: 'Contest synced with YouTube solutions',
      syncResult: result,
      solutions
    });
  } catch (error) {
    console.error('Error syncing contest with YouTube:', error);
    res.status(500).json({ message: 'Error syncing contest with YouTube' });
  }
});

module.exports = router;
