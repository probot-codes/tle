const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();


const youtubeService = require('./services/youtubeService');


const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/contest-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contests', require('./routes/contests'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/solutions', require('./routes/solutions'));


if (process.env.YOUTUBE_API_KEY) {
  youtubeService.schedulePlaylistSync();
  console.log('YouTube playlist sync service started');
} else {
  console.warn('WARNING: YOUTUBE_API_KEY not found in environment. YouTube playlist sync service not started.');
}


if (process.env.NODE_ENV === 'production') {
  
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
