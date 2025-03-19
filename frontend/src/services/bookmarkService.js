import axios from '../api';

// Get auth token from local storage
const getAuthToken = () => localStorage.getItem('token');

// Add authorization header if token exists
const getAuthConfig = () => {
  const token = getAuthToken();
  if (token) {
    return {
      headers: {
        'x-auth-token': token
      }
    };
  }
  return {};
};

// Get all bookmarked contests for the current user
export const getBookmarkedContests = async () => {
  try {
    const response = await axios.get('/api/bookmarks', getAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching bookmarked contests:', error);
    throw error;
  }
};

// Add a contest to bookmarks
export const addBookmark = async (contest) => {
  try {
    const response = await axios.post('/api/bookmarks', contest, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
};

// Remove a contest from bookmarks
export const removeBookmark = async (contestId, platform) => {
  try {
    const response = await axios.delete(
      `/api/bookmarks/${contestId}?platform=${platform}`, 
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};

// Check if a contest is bookmarked
export const checkBookmarkStatus = async (contestId, platform) => {
  try {
    const response = await axios.get(
      `/api/bookmarks/check/${contestId}?platform=${platform}`, 
      getAuthConfig()
    );
    return response.data.isBookmarked;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

// Toggle bookmark (add if not bookmarked, remove if already bookmarked)
export const toggleBookmark = async (contest) => {
  try {
    console.log('Toggle bookmark for contest:', contest);
    
    // Check if contest is already bookmarked
    const isBookmarked = await checkBookmarkStatus(contest.contestId, contest.platform);
    console.log('Is currently bookmarked:', isBookmarked);
    
    if (isBookmarked) {
      // Remove bookmark
      const result = await removeBookmark(contest.contestId, contest.platform);
      return { ...result, action: 'removed' };
    } else {
      // Prepare contest data for bookmarking
      const bookmarkData = {
        contestId: contest.contestId,
        slug: contest.slug || `${contest.platform.toLowerCase()}-${contest.contestId}`,
        name: contest.name || 'Contest ' + contest.contestId,
        platform: contest.platform,
        date: contest.date,
        link: contest.link,
        duration: contest.duration,
        status: contest.status || 'UPCOMING'
      };
      
      console.log('Adding bookmark with data:', bookmarkData);
      
      // Add bookmark
      const result = await addBookmark(bookmarkData);
      return { ...result, action: 'added' };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
};
