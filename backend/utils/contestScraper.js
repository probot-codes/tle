const axios = require('axios');
const cheerio = require('cheerio');

const getCodeChefContests = async () => {
  try {
    const response = await axios.get('https://www.codechef.com/api/list/contests/all');
    const data = response.data;
    
    const allContests = [
      ...data.present_contests.map(contest => ({
        id: contest.contest_code,
        slug: contest.contest_code.toLowerCase(),
        name: contest.contest_name,
        platform: 'CodeChef',
        link: `https://www.codechef.com/${contest.contest_code}`,
        date: new Date(contest.contest_start_date_iso),
        duration: parseInt(contest.contest_duration, 10),
        status: 'ONGOING'
      })),
      ...data.future_contests.map(contest => ({
        id: contest.contest_code,
        slug: contest.contest_code.toLowerCase(),
        name: contest.contest_name,
        platform: 'CodeChef',
        link: `https://www.codechef.com/${contest.contest_code}`,
        date: new Date(contest.contest_start_date_iso),
        duration: parseInt(contest.contest_duration, 10),
        status: 'UPCOMING'
      })),
      ...data.past_contests.map(contest => ({
        id: contest.contest_code,
        slug: contest.contest_code.toLowerCase(),
        name: contest.contest_name,
        platform: 'CodeChef',
        link: `https://www.codechef.com/${contest.contest_code}`,
        date: new Date(contest.contest_start_date_iso),
        duration: parseInt(contest.contest_duration, 10),
        status: 'FINISHED'
      }))
    ];
    
    return allContests;
  } catch (error) {
    console.error('Error fetching CodeChef contests:', error);
    return [];
  }
};

const getLeetCodeContests = async () => {
  try {
    
    const response = await axios.post('https://leetcode.com/graphql', {
      query: `{ 
        upcomingContests { 
          title 
          startTime 
          duration 
        } 
        pastContests { 
          totalNum 
          data { 
            title 
            startTime 
            duration 
          } 
        } 
      }`
    });
    
    const contests = [];
    const now = new Date();
    
    
    if (response.data?.data?.upcomingContests) {
      response.data.data.upcomingContests.forEach(contest => {
        const startTime = new Date(contest.startTime * 1000);
        const titleSlug = contest.title.toLowerCase().replace(/\s+/g, '-');
        
        
        let slug = titleSlug;
        const weeklyMatch = contest.title.match(/weekly\s+contest\s+(\d+)/i);
        const biweeklyMatch = contest.title.match(/biweekly\s+contest\s+(\d+)/i);
        
        if (weeklyMatch) {
          slug = `weekly${weeklyMatch[1]}`;
        } else if (biweeklyMatch) {
          slug = `biweekly${biweeklyMatch[1]}`;
        }
        
        contests.push({
          id: titleSlug,
          slug: slug,
          name: contest.title,
          platform: 'LeetCode',
          link: `https://leetcode.com/contest/${slug}`,
          date: startTime,
          duration: Math.floor(contest.duration / 60), 
          status: 'UPCOMING'
        });
      });
    }
    
    
    if (response.data?.data?.pastContests?.data) {
      response.data.data.pastContests.data.forEach(contest => {
        const startTime = new Date(contest.startTime * 1000);
        const titleSlug = contest.title.toLowerCase().replace(/\s+/g, '-');
        
        
        let slug = titleSlug;
        const weeklyMatch = contest.title.match(/weekly\s+contest\s+(\d+)/i);
        const biweeklyMatch = contest.title.match(/biweekly\s+contest\s+(\d+)/i);
        
        if (weeklyMatch) {
          slug = `weekly${weeklyMatch[1]}`;
        } else if (biweeklyMatch) {
          slug = `biweekly${biweeklyMatch[1]}`;
        }
        
        contests.push({
          id: titleSlug,
          slug: slug,
          name: contest.title,
          platform: 'LeetCode',
          link: `https://leetcode.com/contest/${slug}`,
          date: startTime,
          duration: Math.floor(contest.duration / 60), 
          status: 'FINISHED'
        });
      });
    }
    
    return contests;
  } catch (error) {
    console.error('Error fetching LeetCode contests:', error);
    
    
    try {
      return await scrapeLeetCodeContests();
    } catch (scrapeError) {
      console.error('Error scraping LeetCode contests:', scrapeError);
      return [];
    }
  }
};

const scrapeLeetCodeContests = async () => {
  try {
    const response = await axios.get('https://leetcode.com/contest/');
    const $ = cheerio.load(response.data);
    const contests = [];
    
    
    $('.contest-card').each((i, element) => {
      const titleElement = $(element).find('.contest-title');
      const title = titleElement.text().trim();
      const link = 'https://leetcode.com/contest/'
      const timeElement = $(element).find('.time-info');
      
      
      let date = new Date();
      let status = 'UPCOMING';
      
      if (timeElement.text().includes('Starts')) {
        const timeStr = timeElement.text().replace('Starts: ', '').trim();
        date = new Date(timeStr);
        status = 'UPCOMING';
      } else if (timeElement.text().includes('Running')) {
        status = 'ONGOING';
      } else {
        status = 'FINISHED';
      }
      
      contests.push({
        name: title,
        platform: 'LeetCode',
        link: link,
        date: date,
        duration: 90, 
        status: status
      });
    });
    
    return contests;
  } catch (error) {
    console.error('Error scraping LeetCode contests:', error);
    return [];
  }
};

const getCodeforcesContests = async () => {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list');
    
    const allContests = [
      ...response.data.result
        .filter(contest => contest.phase === 'BEFORE')
        .map(contest => {
          
          let slug = '';
          if (contest.name) {
            
            const roundMatch = contest.name.match(/Round\s+(\d+)/i);
            const divMatch = contest.name.match(/Div\.?\s*(\d+)/i);
            
            if (roundMatch) {
              slug = `round${roundMatch[1]}`;
              if (divMatch) {
                slug += `-div${divMatch[1]}`;
              }
            } else {
              
              slug = contest.name.toLowerCase()
                .replace(/[^\w\s-]/g, '') 
                .replace(/\s+/g, '-')     
                .substring(0, 30);       
            }
          }
          
          return {
            id: contest.id,
            slug: slug || `cf-${contest.id}`,
            name: contest.name || 'Unnamed Contest',
            platform: 'Codeforces',
            date: new Date(contest.startTimeSeconds * 1000),
            link: `https://codeforces.com/contest/${contest.id}`,
            duration: Math.floor(contest.durationSeconds / 3600),
            status: 'UPCOMING'
          };
        }),
      ...response.data.result
        .filter(contest => contest.phase === 'FINISHED')
        .slice(0, 30) 
        .map(contest => {
          
          let slug = '';
          if (contest.name) {
            
            const roundMatch = contest.name.match(/Round\s+(\d+)/i);
            const divMatch = contest.name.match(/Div\.?\s*(\d+)/i);
            
            if (roundMatch) {
              slug = `round${roundMatch[1]}`;
              if (divMatch) {
                slug += `-div${divMatch[1]}`;
              }
            } else {
              
              slug = contest.name.toLowerCase()
                .replace(/[^\w\s-]/g, '') 
                .replace(/\s+/g, '-')     
                .substring(0, 30);       
            }
          }
          
          return {
            id: contest.id,
            slug: slug || `cf-${contest.id}`,
            name: contest.name || 'Unnamed Contest',
            platform: 'Codeforces',
            date: new Date(contest.startTimeSeconds * 1000),
            link: `https://codeforces.com/contest/${contest.id}`,
            duration: Math.floor(contest.durationSeconds / 3600),
            status: 'FINISHED'
          };
        })
    ];
    
    return allContests;
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error);
    return [];
  }
};

const getAllContests = async () => {
  try {
    const [codechefContests, leetcodeContests, codeforcesContests] = await Promise.all([
      getCodeChefContests(),
      getLeetCodeContests(),
      getCodeforcesContests()
    ]);
    
    const allContests = [
      ...codechefContests,
      ...leetcodeContests,
      ...codeforcesContests
    ];
    
    
    const processedContests = allContests.map((contest, index) => {
      if (!contest.slug) {
        
        let slug = '';
        if (contest.name) {
          slug = contest.name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 30);
        } else {
          slug = `${contest.platform.toLowerCase()}-${index}`;
        }
        return { ...contest, slug };
      }
      return contest;
    });
    
    console.log(`getAllContests: Found ${processedContests.length} contests`);
    return processedContests;
  } catch (error) {
    console.error('Error fetching all contests:', error);
    return [];
  }
};

module.exports = {
  getCodeChefContests,
  getLeetCodeContests,
  getCodeforcesContests,
  getAllContests
};
