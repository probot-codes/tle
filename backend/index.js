const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const contestRoutes = require('./routes/contests');
const bookmarkRoutes = require('./routes/bookmarks');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


app.get('/', (req, res) => {
  res.send('Welcome to the Competitive Programming Tracker API');
});
app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/bookmarks', bookmarkRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
