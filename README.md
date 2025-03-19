# Contest Tracker

Hey there! Welcome to Contest Tracker. I built this as an assignment for the TLE Eliminators team to help myself and fellow competitive programmers keep track of contests and their solutions across Codeforces, CodeChef, and LeetCode. No more missing contests or scrambling to find good video solutions!

## What It Does

This app pulls contest data from major competitive programming platforms and automatically syncs with YouTube channels that post high-quality solutions. You can:

- See all upcoming, ongoing, and past contests in one place
- Bookmark contests you're interested in
- Watch video solutions from top creators right inside the app
- Filter contests by platform to focus on what matters to you

## Tech Under the Hood

I've built this using the MERN stack:
- MongoDB for the database
- Express.js for the backend
- React with Chakra UI for the frontend
- Node.js as the runtime

## API Documentation

Here's a breakdown of the main API endpoints in case you want to use them or contribute:

### Contest Endpoints

- `GET /api/contests/all`
  Gets all contests from all platforms. Returns an array of contests sorted by date.

- `GET /api/contests/codeforces`
  Fetches only Codeforces contests. Pulls directly from their API for real-time data.

- `GET /api/contests/codechef`
  Retrieves CodeChef contests, including ongoing and upcoming ones.

- `GET /api/contests/leetcode`
  Gets contests from LeetCode, nicely formatted to match our other data.

- `GET /api/contests/:platform/:slug`
  Retrieves details for a specific contest. For example, `/api/contests/codeforces/codeforces-round-823` gets you all the details about Codeforces Round #823.

- `POST /api/contests/:contestId/sync-solutions`
  Admin-only endpoint that triggers a manual sync of YouTube solutions for a specific contest.

### Solution Endpoints

- `GET /api/solutions`
  Retrieves all video solutions in the database, sorted by publish date.

- `GET /api/solutions/contest/:contestId`
  Gets all video solutions for a specific contest, based on the contest's MongoDB ID.

- `GET /api/solutions/contest/name/:contestName`
  Finds solutions by matching against contest names. Useful for searching.

- `GET /api/solutions/platform/:platform`
  Retrieves all solutions for contests from a specific platform.

- `POST /api/solutions/sync`
  Admin-only endpoint that triggers a manual sync of all YouTube playlists.

### User Endpoints

- `POST /api/users/register`
  Creates a new user account. Requires username, email, and password.

- `POST /api/users/login`
  Authenticates a user and returns a JWT token for subsequent requests.

- `GET /api/users/me`
  Returns the profile of the currently logged-in user.

### Bookmark Endpoints

- `GET /api/bookmarks`
  Gets all bookmarks for the current user.

- `POST /api/bookmarks/:contestId`
  Adds a contest to the user's bookmarks.

- `DELETE /api/bookmarks/:contestId`
  Removes a contest from the user's bookmarks.

## User Interface

The UI is built with simplicity and practicality in mind. Here are the main screens:

1. **Contest Dashboard**: Shows all contests with filtering options. Each contest card displays key info like platform, name, date, and status.

2. **Contest Detail**: Shows everything about a specific contest, including video solutions when available. You can bookmark the contest from here.

3. **Login/Register**: Clean forms for authentication.

4. **Admin Panel**: For authorized users only - lets you manually trigger the YouTube sync process.

## YouTube Sync Feature

This is one of the coolest parts - the app automatically fetches and links video solutions by:

1. Monitoring specific YouTube playlists (configured in youtubeService.js)
2. Using regex patterns to match video titles to contests
3. Regularly syncing (every 6 hours) to keep solutions up to date

The magic happens in the `youtubeService.js` file. It recognizes contest names in video titles like "Codeforces Round 823 Solutions" and links them to the appropriate contest.

## TLE Eliminators Integration

This project specifically syncs with the TLE Eliminators YouTube channel, which provides high-quality solutions to competitive programming contests. I'm building this application as part of an assignment for the TLE Eliminators team. Their videos are an excellent resource for understanding problem-solving approaches in contests from Codeforces, CodeChef, and LeetCode.

## Getting Started

1. Clone the repo
2. Set up MongoDB
3. Add your YouTube API key to the `.env` file (see below)
4. Run the backend: `cd backend && npm install && npm run dev`
5. Run the frontend: `cd frontend && npm install && npm start`

Required `.env` variables:
```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_for_tokens
YOUTUBE_API_KEY=get_this_from_google_cloud_console
```

## That's it!

Special thanks to TLE Eliminators for the opportunity to work on this assignment and for providing such valuable educational content to the competitive programming community.

Feel free to open issues or PRs if you find bugs or have ideas. Hope this helps with your competitive programming journey!

~ Prabhat
