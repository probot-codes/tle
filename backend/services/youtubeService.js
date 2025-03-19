const axios = require('axios');
const Contest = require('../models/Contest');
const Solution = require('../models/Solution');
const mongoose = require('mongoose');
require('dotenv').config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const PLAYLISTS = {
  LEETCODE: {
    id: 'PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr',
    patterns: [
      { regex: /Leetcode Weekly Contest (\d+)/i, platform: 'LeetCode', type: 'Weekly Contest' },
      { regex: /Leetcode Biweekly Contest (\d+)/i, platform: 'LeetCode', type: 'Biweekly Contest' }
    ]
  },
  CODEFORCES: {
    id: 'PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB',
    patterns: [
      { regex: /Codeforces Round (\d+)/i, platform: 'Codeforces', type: 'Round' },
      { regex: /Educational Codeforces Round (\d+)/i, platform: 'Codeforces', type: 'Educational Round' }
    ]
  },
  CODECHEF: {
    id: 'PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr',
    patterns: [
      { regex: /Codechef Starters (\d+)/i, platform: 'CodeChef', type: 'Starters' }
    ]
  }
};

async function fetchPlaylistVideos(playlistId) {
  try {
    const params = {
      part: 'snippet,contentDetails',
      playlistId,
      key: YOUTUBE_API_KEY
    };
    
    const response = await axios.get(url, { params });
    return response.data.items || [];
  } catch (error) {
    console.error(`Error fetching YouTube playlist ${playlistId}:`, error.message);
    return [];
  }
}

function matchVideoTitle(title, patterns) {
  for (const pattern of patterns) {
    const match = title.match(pattern.regex);
    if (match && match[1]) {
      return {
        platform: pattern.platform,
        type: pattern.type,
        number: match[1]
      };
    }
  }
  return null;
}


async function findMatchingContest(contestInfo) {
  try {
    let namePattern;
    
    switch (contestInfo.platform) {
      case 'LeetCode':
        namePattern = `${contestInfo.type} ${contestInfo.number}`;
        break;
      case 'Codeforces':
        if (contestInfo.type === 'Round') {
          namePattern = `Codeforces Round #${contestInfo.number}`;
        } else {
          namePattern = `Educational Codeforces Round #${contestInfo.number}`;
        }
        break;
      case 'CodeChef':
        namePattern = `CodeChef Starters ${contestInfo.number}`;
        break;
      default:
        return null;
    }
    
    const contest = await Contest.findOne({
      platform: contestInfo.platform,
      name: { $regex: new RegExp(namePattern, 'i') }
    });
    
    return contest;
  } catch (error) {
    console.error('Error finding matching contest:', error);
    return null;
  }
}

async function addVideoSolution(contest, video) {
  try {
    let solution = await Solution.findOne({
      contestId: contest._id,
      videoId: video.contentDetails.videoId
    });
    
    if (!solution) {
      solution = new Solution({
        contestId: contest._id,
        platform: contest.platform,
        contestName: contest.name,
        videoId: video.contentDetails.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
        publishedAt: video.snippet.publishedAt,
        createdAt: new Date()
      });
      
      await solution.save();
      
      await Contest.findByIdAndUpdate(
        contest._id,
        { $addToSet: { solutionIds: solution._id } },
        { new: true }
      );
      
      console.log(`Added new solution: ${solution.title} for contest: ${contest.name}`);
    } else {
      solution.title = video.snippet.title;
      solution.description = video.snippet.description;
      solution.thumbnailUrl = video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url;
      solution.updatedAt = new Date();
      
      await solution.save();
      
      console.log(`Updated solution: ${solution.title}`);
    }
    
    return solution;
  } catch (error) {
    console.error('Error adding video solution:', error);
    throw error;
  }
}

async function syncAllPlaylists() {
  const summary = {
    processed: 0,
    added: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };
  
  for (const [playlistName, playlist] of Object.entries(PLAYLISTS)) {
    console.log(`Processing ${playlistName} playlist...`);
    
    try {
      const videos = await fetchPlaylistVideos(playlist.id);
      summary.processed += videos.length;
      
      for (const video of videos) {
        const videoTitle = video.snippet.title;
        const contestInfo = matchVideoTitle(videoTitle, playlist.patterns);
        
        if (contestInfo) {
          const contest = await findMatchingContest(contestInfo);
          
          if (contest) {
            const existing = await Solution.findOne({
              contestId: contest._id,
              videoId: video.contentDetails.videoId
            });
            
            if (existing) {
              await addVideoSolution(contest, video);
              summary.updated++;
            } else {
              await addVideoSolution(contest, video);
              summary.added++;
            }
          } else {
            console.log(`No matching contest found for video: ${videoTitle}`);
            summary.skipped++;
          }
        } else {
          console.log(`Could not match video title to a contest pattern: ${videoTitle}`);
          summary.skipped++;
        }
      }
    } catch (error) {
      console.error(`Error syncing ${playlistName} playlist:`, error);
      summary.errors++;
    }
  }
  
  return summary;
}

function schedulePlaylistSync() {
  syncAllPlaylists()
    .then(summary => {
      console.log('Initial YouTube playlist sync completed:', summary);
    })
    .catch(error => {
      console.error('Initial YouTube playlist sync failed:', error);
    });
  
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    console.log('Running scheduled YouTube playlist sync...');
    syncAllPlaylists()
      .then(summary => {
        console.log('Scheduled YouTube playlist sync completed:', summary);
      })
      .catch(error => {
        console.error('Scheduled YouTube playlist sync failed:', error);
      });
  }, SIX_HOURS);
}

module.exports = {
  fetchPlaylistVideos,
  matchVideoTitle,
  findMatchingContest,
  addVideoSolution,
  syncAllPlaylists,
  schedulePlaylistSync
};
